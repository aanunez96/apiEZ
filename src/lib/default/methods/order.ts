function order(query, allFields: string[]) {
  if (!query?.ordering) {
    return {};
  }
  const ordering = Array.isArray(query?.ordering) ? query?.ordering : [query?.ordering];
  const orderBy = ordering.reduce((parameters, orderingValue) => {
    const field = orderingValue.replace('-', '');
    if (allFields.includes(field)) {
      return {
        ...parameters,
        [field]: orderingValue.charAt(0) === '-' ? 'desc' : 'asc',
      };
    }
    return {
      ...parameters,
    };
  }, {} as any);

  return {
    orderBy,
  };
}

module.exports = order;
