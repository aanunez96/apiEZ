function order(query, allFields: string[]) {
  if (!query?.ordering) {
    return {};
  }

  const orders = Array.isArray(query?.ordering)
    ? query?.ordering.reduce((parameters, field) => {
      if (allFields.includes(field) || allFields.includes(`-${field}`)) {
        return {
          ...parameters,
          [field]: field.charAt(0) === '-' ? 'desc' : 'asc',
        };
      }
      return {
        ...parameters,
      };
    }, {} as any)
    : {
      [query?.ordering]: query?.ordering.charAt(0) === '-' ? 'desc' : 'asc',
    };

  return {
    orderBy: orders,
  };
}

module.exports = order;
