module.exports = () => (req, res, next) => {
  res.locals.usePurgedCSS = ['cookies', 'query'].some((key) => {
    const { __purgecss: purge } = req[key];
    return purge && !['false', '0', 'null'].includes(purge);
  });
  res.locals.embedCSS = ['cookies', 'query'].some((key) => {
    const { __embedcss: embed } = req[key];
    return embed && !['false', '0', 'null'].includes(embed);
  });
  next();
};
