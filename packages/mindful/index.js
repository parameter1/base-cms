const { MindfulApiClient } = require('./api-client');
const { MindfulMarkoWebService } = require('./marko-web/service');

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

/**
 * @prop {string} namespace An object id representing the default subscription question
 * @prop {string} url The mindful url default https://graphql.mindfulcms.com/query
 */
