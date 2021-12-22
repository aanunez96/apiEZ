const { formatterQueryValue: formatterQuery } = require('./query_formatter.ts');

const options = ['gt', 'gte', 'lt', 'lte'];

function comparison(query, allFields) {
  const nameFields = allFields
    .reduce((fields, { name, ...rest }) => ({
      ...fields,
      [name]: rest.type,
    }), {} as any);

  return Object.keys(query).reduce((filters, key) => {
    const [field, filter] = key.split('__');
    if (options.includes(filter)) {
      return {
        ...filters,
        [field]: {
          [filter]: formatterQuery(query[key], nameFields[field]),
        },
      };
    }
    return filters;
  }, {} as any);
}

module.exports = comparison;
