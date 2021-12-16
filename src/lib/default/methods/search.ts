function search(query, allFields) {
  if (!query?.search) {
    return {};
  }
  const nameFields = allFields
    .filter((f) => f.type === 'String') // TODO: Figure out an "contains" alternatives to others types
    .map((f) => f.name);
  const searchFields = Array.isArray(query?.search_fields) ? query?.search_fields : [query?.search_fields];
  const fields = searchFields.length > 0 ? searchFields.filter((f) => nameFields.includes(f)) : nameFields;
  return fields.reduce((jasonField, field) => ({
    ...jasonField,
    [field]: {
      contains: query?.search,
      // mode: 'insensitive', TODO: check how it's crashing the request, we need case insensitive
    },
  }), {} as any);
}

module.exports = search;
