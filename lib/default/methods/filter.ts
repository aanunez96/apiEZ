const { formatterQueryValue: formatter } = require('../util/query_formatter.ts');

function filter(query, allFields: any[]) {
  const nameFields = allFields
    .reduce((fields, { name, ...rest }) => ({
      ...fields,
      [name]: rest.type,
    }), {} as any);

  return Object.keys(query).reduce((parameters, field) => {
    if (nameFields[field]) {
      return {
        ...parameters,
        [field]: {
          equals: formatter(query[field], nameFields[field]),
        },
      };
    }
    return {
      ...parameters,
    };
  }, {} as any);
}

module.exports = filter;
