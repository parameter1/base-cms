const MarkoWebSearch = require('./index');

module.exports = ({ config, template } = {}) => (req, res) => {
  const $search = new MarkoWebSearch({
    config,
    query: req.query,
  });
  return res.marko(template, { $search });
};
