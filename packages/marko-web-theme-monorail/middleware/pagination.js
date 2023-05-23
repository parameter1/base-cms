module.exports = ({ param = 'page' } = {}) => (req, res, next) => {
  const page = parseInt(req.query[param], 10) || 1;

  const totalPages = ({ perPage, totalCount }) => Math.ceil(totalCount / perPage);

  res.locals.pagination = {
    page,
    skip: ({ skip = 0, perPage } = {}) => {
      if (page < 1) return skip;
      return (perPage * (page - 1)) + skip;
    },
    totalPages,
    nextPage: ({ perPage, totalCount }) => {
      const total = totalPages({ perPage, totalCount });
      if (page < total) return page + 1;
      return null;
    },
    prevPage: () => {
      if (page > 1) return page - 1;
      return null;
    },
  };
  next();
};
