// @ts-ignore
const { PrismaClient } = require('@prisma/client');
// eslint-disable-next-line no-shadow,no-unused-vars
// enum ActionMethodType {
//   // eslint-disable-next-line no-unused-vars
//   CREATE = 'CREATE',
//   // eslint-disable-next-line no-unused-vars
//   READ = 'READ',
//   // eslint-disable-next-line no-unused-vars
//   UPDATE = 'UPDATE',
//   // eslint-disable-next-line no-unused-vars
//   DELETE = 'DELETE',
// }

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
  actionType: string;
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

class ApiEz {
  models: object;

  methods: Methods;

  expressInstance;

  constructor(
    prismaInstance: typeof PrismaClient,
    expressInstance,
    options?: Options,
    replaceDefaultsMethod?: Methods,
  ) {
    this.expressInstance = expressInstance;

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
    // @ts-ignore
    console.log(this.models.Post);
  }
}

module.exports = ApiEz;
