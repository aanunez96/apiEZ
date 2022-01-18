export default function pagination(query) {
  const page = parseInt(query?.page, 10);

  if (page <= 0) {
    return {};
  }

  const take = parseInt(query?.page_size, 10) || 10;
  const skip = (page - 1) * take;

  return {
    take,
    skip,
  };
}

module.exports = pagination;
