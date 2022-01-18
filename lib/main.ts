import createAction from './default/actions/create';
import readAction from './default/actions/read';
import updateAction from './default/actions/update';
import getOneAction from './default/actions/get-one';
import deleteAction from './default/actions/delete';

import order from './default/util/order';
import population from './default/util/population';
import comparison from './default/util/comparison';
import structure from './default/util/structure';

import filter from './default/methods/filter';
import pagination from './default/methods/pagination';
import search from './default/methods/search';

type CommonResponse = {
  [field: string]: {[parameter: string]: string }
}

type PaginationResponse = {
  take?: number;
  skip?: number;
}

type Methods = {
  // eslint-disable-next-line no-unused-vars
  onFilter?: (params: string, allField?) => CommonResponse
  // eslint-disable-next-line no-unused-vars
  onSearch?: (params, allField?) => CommonResponse
  // eslint-disable-next-line no-unused-vars
  onPagination?: (params) => PaginationResponse
}

type Action = {
  // eslint-disable-next-line no-unused-vars
  CREATE?: (modelName, body) => any // action method
  // eslint-disable-next-line no-unused-vars
  READ?: (modelName, queryParams, req?) => any //
  // eslint-disable-next-line no-unused-vars
  GET_ONE?: (modelName, queryParams, id?) => any // action method
  // eslint-disable-next-line no-unused-vars
  UPDATE?: (modelName, id, body) => any // action method
  // eslint-disable-next-line no-unused-vars
  DELETE?: (modelName, id) => any // action method
}

type Options = {
  // eslint-disable-next-line no-unused-vars
  filter?: { [model: string]: (params, allField?) => CommonResponse }
  // eslint-disable-next-line no-unused-vars
  search?: { [model: string]: (params, allField?) => CommonResponse }
  // eslint-disable-next-line no-unused-vars
  pagination?: { [model: string]: (params) => PaginationResponse }
  replaceActions?: { [model: string]: Action }
}

export default class ApiEz {
  models: object;

  methods: Methods;

  actions: Action;

  expressInstance: any;

  prismaInstance: any;

  constructor(
    prismaInstance: any,
    expressInstance: any,
    options?: Options,
    replaceDefaultsMethod?: Methods,
    replaceDefaultsAction?: Action,
  ) {
    this.expressInstance = expressInstance;
    this.prismaInstance = prismaInstance;

    // eslint-disable-next-line no-underscore-dangle
    this.models = (prismaInstance._dmmf.datamodel.models as any[]).reduce(
      (total, { name, fields }) => ({
        ...total,
        [name]: {
          fields,
          filter: options?.filter[name],
          pagination: options?.pagination[name],
          search: options?.search[name],
          replaceActions: options?.replaceActions[name],
        },
      }),
      {} as any,
    );

    this.methods = {
      onFilter: replaceDefaultsMethod?.onFilter || filter,
      onPagination: replaceDefaultsMethod?.onPagination || pagination,
      onSearch: replaceDefaultsMethod?.onSearch || search,
    };

    this.actions = {
      CREATE: replaceDefaultsAction?.CREATE || createAction(prismaInstance),
      READ: replaceDefaultsAction?.READ || readAction(prismaInstance),
      UPDATE: replaceDefaultsAction?.UPDATE || updateAction(prismaInstance),
      DELETE: replaceDefaultsAction?.DELETE || deleteAction(prismaInstance),
      GET_ONE: replaceDefaultsAction?.GET_ONE || getOneAction(prismaInstance),
    };
  }

  init() {
    Object.keys(this.models).forEach((model) => {
      const modelName = model.toLowerCase();
      const { fields } = this.models[model];

      this.expressInstance.post(`/${modelName}`, async (req, res) => {
        try {
          const result = await this.actions.CREATE(modelName, req.body);

          res.json(result);
        } catch (error) {
          res.json({ error });
          throw error;
        }
      });

      this.expressInstance.get(`/${modelName}/:id`, async (req, res) => {
        try {
          const { id } = req.params;
          const queryParams = {
            where: {
              id: parseInt(id, 10),
            },
            ...population(fields),
          };
          const user = await this.actions.GET_ONE(modelName, queryParams, id);

          res.json(user);
        } catch (error) {
          res.json({ error });
          throw error;
        }
      });

      this.expressInstance.get(`/${modelName}`, async (req, res) => {
        const onFilter = this.models[model]?.options?.filter || this.methods.onFilter;
        const onSearch = this.models[model]?.options?.search || this.methods.onSearch;
        const onPagination = this.models[model]?.options?.pagination || this.methods.onPagination;

        try {
          const queryParams = {
            where: {
              ...comparison(req.query, fields),
              ...onSearch(req.query, fields),
              ...onFilter(req.query, fields),
            },
            ...order(req.query, fields),
            ...onPagination(req.query),
            ...population(fields),
          };
          const count = await this.prismaInstance[modelName].count();
          const results = await this.actions.READ(modelName, queryParams, req);
          const fullUrl = `${req.protocol}://${req.get('host')}${req.url}`;

          res.json(structure(req.query, count, results, fullUrl));
        } catch (error) {
          res.json({ error });
          throw error;
        }
      });

      this.expressInstance.put(`/${modelName}/:id`, async (req, res) => {
        try {
          const { id } = req.params;
          const post = await this.actions.UPDATE(modelName, id, req.body);

          res.json(post);
        } catch (error) {
          res.json({ error });
          throw error;
        }
      });

      this.expressInstance.delete(`/${modelName}/:id`, async (req, res) => {
        try {
          const { id } = req.params;
          const user = await this.actions.DELETE(modelName, id);

          res.json(user);
        } catch (error) {
          res.json({ error });
          throw error;
        }
      });
    });
  }
}

// TODO: fix count when filter
// TODO: add object Populated filter e. user__name=bla with "user" as foreign Key
