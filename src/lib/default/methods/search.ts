function search(query, allFields) {
  if (!query?.search) {
    return {};
  }
  const fields = query?.search_fileds || allFields;
  return Array.isArray(fields)
    ? fields.reduce((jasonField, field) => ({
      ...jasonField,
      [field]: {
        contains: query,
        mode: 'insensitive',
      },
    }), {} as any)
    : {
      [fields]: {
        contains: query,
        mode: 'insensitive',
      },
    };
}

module.exports = search;
