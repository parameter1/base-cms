const getUrlWithQueryParams = ({ req, keepParams = [], updateParams = {} }) => {
  // clone of queryObj to prevent changing actual req.query
  const query = {
    ...req.query,
  };
  Object.keys(query).forEach((key) => {
    if (!keepParams.includes(key)) delete query[key];
  });
  Object.keys(updateParams).forEach((key) => {
    // @ToDo: Figure out how to handle arrays & objects if need be.
    // For now compare strings as all query values will be strings
    if (query[key] === updateParams[key].toString()) {
      delete query[key];
    } else {
      query[key] = updateParams[key];
    }
  });
  const queryStr = Object.keys(query || {}).map(key => [
    encodeURIComponent(key),
    encodeURIComponent(query[key]),
  ].join('=')).join('&');

  return (queryStr) ? `${req.route.path}?${queryStr}` : req.route.path;
};

module.exports = { getUrlWithQueryParams };
