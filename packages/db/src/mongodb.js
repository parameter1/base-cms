const { MongoClient, ObjectID, Logger } = require('mongodb');

class Client {
  /**
   *
   * @param {string} dsn
   * @param {?object} options
   */
  constructor(dsn, options) {
    this.dsn = dsn;
    this.options = options;
  }

  /**
   *
   * @param {string} name
   * @param {object} [options]
   * @returns {Promise<Db>}
   */
  async db(name, options) {
    const client = await this.connect();
    return client.db(name, options);
  }

  /**
   *
   * @param {string} dbName
   * @param {string} name
   * @param {object} [options]
   * @param {function} [cb]
   * @returns {Promise<Collection>}
   */
  async collection(dbName, name, options, cb) {
    const db = await this.db(dbName);
    return db.collection(name, options, cb);
  }

  /**
   *
   * @param {object} command
   * @param {object} options
   */
  async command(command, options) {
    const client = await this.connect();
    const db = await client.db('test');
    return db.command(command, options);
  }

  /**
   *
   */
  async admin() {
    const client = await this.connect();
    const db = await client.db('test');
    return db.admin();
  }

  /**
   *
   * @param {boolean} force
   */
  async close(force) {
    if (this.promise) {
      const client = await this.promise;
      await client.close(force);
    }
  }

  /**
   * @returns {Promise<CoreMongoClient>}
   */
  async connect() {
    if (!this.promise) {
      this.promise = MongoClient.connect(this.dsn, this.options);
    }
    const client = await this.promise;
    return client;
  }
}

/**
 * @typedef {import("mongodb/lib/db")} Db
 * @typedef {import("mongodb/lib/collection")} Collection
 * @typedef {import("mongodb/lib/mongo_client")} CoreMongoClient
 */

module.exports = {
  Client,
  ObjectID,
  Logger,
};
