function pagination(query) {
  if (!query?.page) {
    return {};
  }
  const take = parseInt(query?.page_size, 10) || 10;
  const skip = (query?.page - 1) * take;
  return {
    take,
    skip,
  };
}

module.exports = pagination;
