const {
  green,
  yellow,
  magenta,
  gray,
} = require('chalk');

module.exports = (msg) => {
  const message = `${magenta(msg.name)} newsletters ${green('ready')} on ${yellow(msg.location)} (Tenant: ${gray(msg.tenantKey)}) (API: ${gray(msg.graphqlUri)})`;
  return message;
};
