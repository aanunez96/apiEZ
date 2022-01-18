import formatterQueryValue from '../util/query_formatter';

export default function filter(query, allFields: any[]) {
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
          equals: formatterQueryValue(query[field], nameFields[field]),
        },
      };
    }
    return {
      ...parameters,
    };
  }, {} as any);
}

module.exports = filter;
