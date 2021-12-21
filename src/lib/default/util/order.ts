function order(query, allFields: any[]) {
  if (!query?.ordering) {
    return {};
  }
  const nameFields = allFields.map((f) => f.name);
  const ordering = Array.isArray(query?.ordering) ? query?.ordering : [query?.ordering];
  const orderBy = ordering.reduce((parameters, orderingValue) => {
    const field = orderingValue.replace('-', '');
    if (nameFields.includes(field)) {
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
