module.exports = () => ((req, res, next) => {
  const { disabledFeatures } = req.cookies;
  res.locals.disabledFeatures = new Set();
  if (disabledFeatures) {
    try {
      disabledFeatures.split(',').forEach((flag) => {
        const trimmed = flag.trim();
        if (trimmed) res.locals.disabledFeatures.add(trimmed);
      });
    } catch (e) {
      next();
    }
  }
  next();
});
