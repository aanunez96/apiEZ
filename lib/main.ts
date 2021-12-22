// @ts-ignore
const { PrismaClient } = require('@prisma/client');
// @ts-ignore
const express = require('express');

const getOrder = require('./default/util/order.ts');
const getPopulation = require('./default/util/population.ts');
const getComparison = require('./default/util/comparison.ts');

const getPagination = require('./default/methods/pagination.ts');
const getFilter = require('./default/methods/filter.ts');
const getSearch = require('./default/methods/search.ts');

const createAct = require('./default/actions/create.ts');
const deleteAct = require('./default/actions/delete.ts');
const getOneAct = require('./default/actions/get-one.ts');
const updateAct = require('./default/actions/update.ts');
const readAct = require('./default/actions/read.ts');

interface Methods {
  // eslint-disable-next-line no-unused-vars
  onFilter?: (params, allField?) => {[field: string]: {[parameter: string]: string }}
  // eslint-disable-next-line no-unused-vars
  onSearch?: (params, allField?) => {[field: string]: {[parameter: string]: string }}
  // eslint-disable-next-line no-unused-vars
  onPagination?: (params) => { take: number; skip: number; }
}

interface Action {
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

interface Options {
  // eslint-disable-next-line no-unused-vars
  filter?: { [model: string]: (params, allField?) => {[field: string]: {[parameter: string]: string }} },
  // eslint-disable-next-line no-unused-vars
  search?: { [model: string]: (params, allField?) => {[field: string]: {[parameter: string]: string }} },
  // eslint-disable-next-line no-unused-vars
  pagination?: { [model: string]: (params) => { take: number; skip: number; } },
  replaceActions?: { [model: string]: Action },
}

// @ts-ignore
class ApiEz {
  models: object;

  methods: Methods;

  actions: Action;

  expressInstance: typeof express;

  prismaInstance: typeof PrismaClient;

  constructor(
    prismaInstance: typeof PrismaClient,
    expressInstance: typeof express,
    options?: Options,
    replaceDefaultsMethod?: Methods,
    replaceDefaultsAction?: Action,
  ) {
    this.expressInstance = expressInstance;
    this.prismaInstance = prismaInstance;

    // eslint-disable-next-line no-undef,no-underscore-dangle
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
      onFilter: replaceDefaultsMethod?.onFilter || getFilter,
      onPagination: replaceDefaultsMethod?.onPagination || getPagination,
      onSearch: replaceDefaultsMethod?.onSearch || getSearch,
    };

    this.actions = {
      CREATE: replaceDefaultsAction?.CREATE || createAct(prismaInstance),
      READ: replaceDefaultsAction?.READ || readAct(prismaInstance),
      UPDATE: replaceDefaultsAction?.UPDATE || updateAct(prismaInstance),
      DELETE: replaceDefaultsAction?.DELETE || deleteAct(prismaInstance),
      GET_ONE: replaceDefaultsAction?.GET_ONE || getOneAct(prismaInstance),
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
            ...getPopulation(fields),
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
              ...getComparison(req.query, fields),
              ...onSearch(req.query, fields),
              ...onFilter(req.query, fields),
            },
            ...getOrder(req.query, fields),
            ...onPagination(req.query),
            ...getPopulation(fields),
          };
          const count = await this.prismaInstance[modelName].count();
          const results = await this.actions.READ(modelName, queryParams, req);
          res.json({ count, results });
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

module.exports = ApiEz;
