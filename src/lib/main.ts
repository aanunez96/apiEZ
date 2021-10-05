// @ts-ignore
const { PrismaClient } = require('@prisma/client');
// @ts-ignore
const express = require('express');
// eslint-disable-next-line no-shadow,no-unused-vars
enum ActionMethodType {
  // eslint-disable-next-line no-unused-vars
  CREATE = 'CREATE',
  // eslint-disable-next-line no-unused-vars
  READ = 'READ',
  // eslint-disable-next-line no-unused-vars
  UPDATE = 'UPDATE',
  // eslint-disable-next-line no-unused-vars
  DELETE = 'DELETE',
}

interface Filter {
  fields?: string[] // named on fields for the model above
  // eslint-disable-next-line no-unused-vars
  action: (prismaModelInstance) => any[] // method for filter
}

interface Search {
  // eslint-disable-next-line no-unused-vars
  action: (prismaModelInstance, searchFields?: string[]) => any[] // method for search
}

interface Pagination {
  // eslint-disable-next-line no-unused-vars
  action: (prismaModelInstance) => any[] // method for pagination
}

interface replaceAction {
  actionType: ActionMethodType;
  // eslint-disable-next-line no-unused-vars
  action: (prismaModelInstance, req, res) => any[] // action method
}

interface Options {
  filters?: { [model: string]: Filter[]},
  search?: { [model: string]: Search },
  pagination?: { [model: string]: Pagination },
  replaceActions?: { [model: string]: replaceAction[] },
}

interface Methods {
  // eslint-disable-next-line no-unused-vars
  onFilter: (prismaModelInstance) => any[]
  // eslint-disable-next-line no-unused-vars
  onSearch: (prismaModelInstance, searchFields?: string[]) => any[]
  // eslint-disable-next-line no-unused-vars
  onPagination: (prismaModelInstance) => any[]
}

// @ts-ignore
class ApiEz {
  models: object;

  methods: Methods;

  expressInstance: typeof express;

  prismaInstance: typeof PrismaClient;

  constructor(
    prismaInstance: typeof PrismaClient,
    expressInstance: typeof express,
    options?: Options,
    replaceDefaultsMethod?: Methods,
  ) {
    this.expressInstance = expressInstance;
    this.prismaInstance = prismaInstance;

    this.methods = {
      onFilter: replaceDefaultsMethod?.onFilter || undefined,
      onPagination: replaceDefaultsMethod?.onPagination || undefined,
      onSearch: replaceDefaultsMethod?.onSearch || undefined,
    };

    // eslint-disable-next-line no-undef,no-underscore-dangle
    this.models = (prismaInstance._dmmf.datamodel.models as any[]).reduce(
      (total, { name, fields }) => ({
        ...total,
        [name]: {
          fields,
          filters: options?.filters[name],
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

      this.expressInstance.get(`/${modelName}`, async (_req, res) => {
        try {
          const entities = await this.prismaInstance[modelName].findMany();
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
