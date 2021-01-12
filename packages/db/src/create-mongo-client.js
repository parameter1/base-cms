const { Client } = require('./mongodb');

const defaults = {
  bufferMaxEntries: 0,
  connectTimeoutMS: 200,
  ignoreUndefined: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

module.exports = (dsn, options = {}) => new Client(dsn, { ...defaults, ...options });
