module.exports = () => (req, res, next) => {
  res.locals.onlyCritCSS = ['cookies', 'query'].some((key) => {
    const { __only_crit_css: crit } = req[key];
    return crit && !['false', '0', 'null'].includes(crit);
  });
  next();
};
