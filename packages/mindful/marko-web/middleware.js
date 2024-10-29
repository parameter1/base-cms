const { MindfulApiClient } = require('../api-client');
const { MindfulMarkoWebService } = require('./service');

module.exports = (params = {}) => (req, res, next) => {
  const client = new MindfulApiClient(params);
  const mindful = {
    client,
    service: new MindfulMarkoWebService({ client }),
  };

  req.mindful = mindful;
  res.locals.mindful = mindful;
  next();
};
