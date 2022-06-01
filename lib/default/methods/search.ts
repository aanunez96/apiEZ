const toArray = (fields) => (Array.isArray(fields) ? fields : [fields]);

export default function search(query, allFields) {
  if (!query?.search) {
    return {};
  }
  const nameFields = allFields
    .filter((f) => f.type === 'String')
    .map((f) => f.name);
  const searchFields = query?.search_fields ? toArray(query?.search_fields) : [];
  const fields = searchFields.length > 0 ? searchFields.filter((f) => nameFields.includes(f)) : nameFields;

  return fields.reduce((jasonField, field) => ({
    ...jasonField,
    [field]: {
      contains: query?.search,
    },
  }), {} as any);
}

module.exports = search;
