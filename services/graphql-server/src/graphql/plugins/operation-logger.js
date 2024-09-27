const newrelic = require('../../newrelic');
const logger = require('../operation-logger');

const noticeError = newrelic.noticeError.bind(newrelic);

module.exports = function operationLoggerPlugin() {
  /** @type {import("apollo-server-core").PluginDefinition} */
  const plugin = {
    requestDidStart() {
      let encounteredError = false;
      return {
        didEncounterErrors() {
          encounteredError = true;
        },
        async willSendResponse(requestContext) {
          if (encounteredError) return;
          if (requestContext.operationName === 'IntrospectionQuery') return;

          logger.run(requestContext).catch(noticeError);
        },
      };
    },
  };
  return plugin;
};
