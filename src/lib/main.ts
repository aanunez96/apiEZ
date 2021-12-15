// @ts-ignore
const { PrismaClient } = require('@prisma/client');
// @ts-ignore
const express = require('express');
const getPagination = require('./default/methods/pagination.ts');
const getOrder = require('./default/methods/order.ts');
const getFilter = require('./default/methods/filter.ts');
const getSearch = require('./default/methods/search.ts');

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
  CREATE?: (prismaModelInstance, req, res) => any // action method
  // eslint-disable-next-line no-unused-vars
  READ?: (prismaModelInstance, req, res) => any // action method
  // eslint-disable-next-line no-unused-vars
  UPDATE?: (prismaModelInstance, req, res) => any // action method
  // eslint-disable-next-line no-unused-vars
  DELETE?: (prismaModelInstance, req, res) => any // action method
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

    this.methods = {
      onFilter: replaceDefaultsMethod?.onFilter || getFilter,
      onPagination: replaceDefaultsMethod?.onPagination || getPagination,
      onSearch: replaceDefaultsMethod?.onSearch || getSearch,
    };

    this.actions = {
      CREATE: replaceDefaultsAction?.CREATE || undefined,
      READ: replaceDefaultsAction?.READ || undefined,
      UPDATE: replaceDefaultsAction?.UPDATE || undefined,
      DELETE: replaceDefaultsAction?.DELETE || undefined,
    };

    // eslint-disable-next-line no-undef,no-underscore-dangle
    this.models = (prismaInstance._dmmf.datamodel.models as any[]).reduce(
      (total, { name, fields }) => ({
        ...total,
        [name]: {
          fields, // TODO: change format to object with attr name as object key and object with all data we will need as value then check all places we are using this
          filter: options?.filter[name],
          pagination: options?.pagination[name],
          search: options?.search[name],
          replaceActions: options?.replaceActions[name],
        },
      }),
      {} as any,
    );
  }

  init() {
    Object.keys(this.models).forEach((model) => {
      const modelName = model.toLowerCase();
      this.expressInstance.post(`/${modelName}`, async (req, res) => {
        try {
          const result = await this.prismaInstance[modelName].create({
            data: req.body,
          });
          res.json(result);
        } catch (error) {
          res.json({ error });
          throw error;
        }
      });

      this.expressInstance.get(`/${modelName}`, async (req, res) => {
        // TODO: Handle Foreign Key and Object
        const { fields } = this.models[model];
        const nameFields = fields.map((f) => f.name);
        const onFilter = this.models[model]?.options?.filter || this.methods.onFilter;
        const onSearch = this.models[model]?.options?.search || this.methods.onSearch;
        const onPagination = this.models[model]?.options?.pagination || this.methods.onPagination;
        try {
          const queryParams = {
            where: {
              ...onSearch(req.query, fields),
              ...onFilter(req.query, fields),
            },
            ...getOrder(req.query, nameFields),
            ...onPagination(req.query),
          };
          const entities = await this.prismaInstance[modelName].findMany(queryParams);
          res.json(entities);
        } catch (error) {
          res.json({ error });
          throw error;
        }
      });

      this.expressInstance.put(`/${modelName}/:id`, async (req, res) => {
        try {
          const { id } = req.params;
          const post = await this.prismaInstance[modelName].update({
            where: { id },
            data: req.body,
          });
          res.json(post);
        } catch (error) {
          res.json({ error });
          throw error;
        }
      });

      this.expressInstance.delete(`/${modelName}/:id`, async (req, res) => {
        try {
          const { id } = req.params;
          const user = await this.prismaInstance[modelName].user.delete({
            where: {
              id,
            },
          });
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
// TODO: replace every end point as a function for reutilice it on return it and use in endpoint
// TODO: handle int filters (lte, gte and stuff like that)
