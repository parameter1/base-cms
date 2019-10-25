const mongodb = require('mongodb');

const { MONGO_DSN } = require('./env');

const { log } = console;

let connection;

const connect = async () => {
  if (!connection) {
    connection = await mongodb.connect(MONGO_DSN, { useNewUrlParser: true });
    log(`> MongoDB connected (${MONGO_DSN})`);
  }
  return connection;
};

const getCollection = async (name) => {
  const conn = await connect();
  return conn.db('google-data-api').collection(name);
};

module.exports = {
  connect,
  ping: async () => {
    const coll = await getCollection('pings');
    const last = new Date((new Date()).valueOf());
    return coll.updateOne({ ping: 'pong' }, { $set: { last } }, { upsert: true });
  },
  retrieve: async (_id) => {
    const coll = await getCollection('responses');
    return coll.findOne({ _id });
  },
  write: () => async (_id, response, ttl) => {
    const coll = await getCollection('responses');
    const expires = new Date((new Date()).valueOf() * ttl);
    return coll.updateOne({ _id }, { $set: { ...response, expires } }, { upsert: true });
  },
};
