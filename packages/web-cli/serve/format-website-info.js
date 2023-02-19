const {
  green,
  yellow,
  magenta,
  gray,
} = require('chalk');

module.exports = (msg) => {
  const { baseBrowseGraphqlUri } = msg;
  let message = `${magenta(msg.name)} website ${green('ready')} on ${yellow(msg.location)} (Site ID: ${gray(msg.siteId)}) (API: ${gray(msg.graphqlUri)})`;
  if (baseBrowseGraphqlUri) message = `${message} (Base Browse API: ${gray(baseBrowseGraphqlUri)})`;
  return message;
};
