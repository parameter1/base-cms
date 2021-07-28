const MarkoWebSearch = require('./index');

module.exports = ({ config, template } = {}) => (req, res) => {
  res.locals.$markoWebSearch = new MarkoWebSearch({
    config,
    query: req.query,
  });
  return res.marko(template);
};
