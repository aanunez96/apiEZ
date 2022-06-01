import formatterQueryValue from '../util/query_formatter';

const getFilter = (value, field, typeFields) => ({
  [field]: {
    equals: formatterQueryValue(value, typeFields[field]),
  },
});

export default function filter(query, allFields: any[]) {
  const typeFields = allFields
    .reduce((fields, { name, ...rest }) => ({
      ...fields,
      [name]: rest.type,
    }), {} as any);

  return Object.keys(query).reduce((parameters, field) => {
    if (typeFields[field]) {
      const value = query[field];

      if (Array.isArray(value)) {
        return {
          ...parameters,
          OR: [
            ...parameters.OR || [],
            ...value.map((val) => getFilter(val, field, typeFields)),
          ],
        };
      }
      return {
        ...parameters,
        ...getFilter(value, field, typeFields),
      };
    }
    return {
      ...parameters,
    };
  }, {} as any);
}

module.exports = filter;
