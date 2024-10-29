const { MindfulApiClient } = require('../api-client');
const { MindfulMarkoWebService } = require('./service');

/**
 * @param {import("express").Application} app
 * @param {MindfulConfig} params
 *
 * @returns {MindfulConfig}
 */

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
