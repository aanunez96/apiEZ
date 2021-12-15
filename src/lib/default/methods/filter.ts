const { formatterFilterValue: formatter } = require('./helper.ts');

const typeWithFormatters = ['String', 'Boolean', 'Int'];

function filter(query, allFields: any[]) {
  const nameFields = allFields
    .filter((f) => typeWithFormatters.includes(f.type)) // TODO: this filter is because of we just add formatter function for string and int, we must add filter for all types
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
