function filter(query, allFields: string[]) {
  return Object.keys(query).reduce((parameters, field) => {
    if (allFields.includes(field)) {
      return {
        ...parameters,
        [field]: {
          equals: query[field],
        },
      };
    }
    return {
      ...parameters,
    };
  }, {} as any);
}

module.exports = filter;
