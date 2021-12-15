function pagination(query) {
  if (!query?.page) {
    return {};
  }
  const take = query?.page_size || 10;
  const skip = (query?.page - 1) * take;
  return {
    take,
    skip,
  };
}

module.exports = pagination;
