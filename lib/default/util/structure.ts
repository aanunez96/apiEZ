const getUrl = (url, page) => {
  const index = url.indexOf('page=') + 5;

  return `${url.substr(0, index)}${page}${url.substr(index + page.toString().length)}`;
};

export default function structure(query, count, result, url) {
  const page = parseInt(query?.page, 10);

  if (!page) {
    return {
      count,
      next: null,
      preview: null,
      result,
    };
  }
  const take = parseInt(query?.page_size, 10) || 10;
  const next = take * page < count ? getUrl(url, page + 1) : null;
  const preview = page > 1 ? getUrl(url, page - 1) : null;

  return {
    count,
    next,
    preview,
    result,
  };
}
