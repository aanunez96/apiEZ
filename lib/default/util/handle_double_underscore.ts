import formatterQueryValue from './query_formatter';

const options = ['gt', 'gte', 'lt', 'lte'];

const comparison = (value, field) => formatterQueryValue(value, field.type);

export default function handleDoubleUnderScore(query, allFields, allModels) {
  const nameFields = allFields
    .reduce((fields, { name, ...rest }) => ({
      ...fields,
      [name]: {
        type: rest.type,
        isList: rest.isList,
        relationName: rest.relationName,
      },
    }), {} as any);

  return Object.keys(query).filter((key) => key.includes('__')).reduce((filters, key) => {
    const [field, filter, secondFilter] = key.split('__');

    if (options.includes(filter)) {
      return {
        ...filters,
        [field]: {
          ...filter[field],
          [filter]: comparison(query[key], nameFields[field]),
        },
      };
    }
    if (nameFields[field].relationName) {
      const parentFieldOption = nameFields[field].isList ? 'some' : 'is';
      const childFieldOption = secondFilter || 'equals';

      return {
        ...filters,
        [field]: {
          ...filters[field],
          [parentFieldOption]: {
            ...filters[field]?.[filter],
            [filter]: {
              [childFieldOption]: formatterQueryValue(query[key], allModels[nameFields[field]?.type]?.fields?.find((e) => e.name === filter)?.type),
            },
          },
        },
      };
    }
    return filters;
  }, {} as any);
}
