const { createMongoClient } = require('@parameter1/base-cms-db');
const { print } = require('graphql');
const { createHash } = require('crypto');

const sha256 = (value) => createHash('sha256').update(value).digest('hex');

class GraphQLOperationLogger {
  /**
   * @param {object} params
   * @param {string} [params.url]
   */
  constructor({ url }) {
    this.url = url;
    if (url) this.client = createMongoClient(this.url);
  }

  get enabled() {
    return Boolean(this.client);
  }

  async collection(name) {
    return this.client.collection('base-cms', name);
  }

  async connect() {
    if (this.enabled) await this.client.connect();
  }

  async close() {
    if (this.enabled) await this.client.close();
  }

  /**
   * @param {GraphQLRequestContextWillSendResponse} requestContext
   */
  async run({
    context,
    document,
    operation,
    operationName,
    request,
  }) {
    if (!this.enabled) return null;
    const body = print(operation);

    const fragments = document.definitions.filter((def) => def.kind === 'FragmentDefinition').map((def) => {
      const frag = print(def);
      const type = frag.match(/fragment .* on (.*) {/)[1].trim();
      return { body: frag, hash: sha256(frag), type };
    });

    const data = {
      fragments,
      operation: {
        body,
        hash: sha256(body),
        name: operationName || null,
        selections: operation.selectionSet.selections.map((selection) => ({
          alias: selection.alias ? selection.alias.value : null,
          kind: selection.kind,
          name: selection.name ? selection.name.value : null,
        })),
        type: operation.operation,
      },
      request: {
        environment: process.env.NODE_ENV,
        headers: Object.keys(context.req.headers).sort().reduce((o, k) => ({
          ...o,
          [k]: context.req.headers[k],
        }), {}),
        ip: context.req.ip,
        variables: request.variables || null,
      },
    };

    const collection = {
      fragments: await this.collection('fragments'),
      operations: await this.collection('operations'),
      requests: await this.collection('requests'),
    };

    const hash = sha256([data.operation.hash, ...fragments.map((frag) => frag.hash)].join());
    const requestHash = sha256(JSON.stringify(data.request));

    await Promise.all([
      fragments.length ? collection.fragments.bulkWrite(fragments.map((frag) => ({
        updateOne: {
          filter: { _id: frag.hash },
          update: {
            $inc: { n: 1 },
            $set: { '_meta.lastSeen': new Date() },
            $setOnInsert: {
              _id: frag.hash,
              '_meta.firstSeen': new Date(),
              body: frag.body,
              type: frag.type,
            },
          },
          upsert: true,
        },
      }))) : Promise.resolve(),
      collection.operations.updateOne({
        _id: hash,
      }, {
        $inc: { n: 1 },
        $set: { '_meta.lastSeen': new Date() },
        $setOnInsert: {
          _id: hash,
          '_meta.firstSeen': new Date(),
          ...data.operation,
          fragments: data.fragments,
        },
      }, { upsert: true }),
      collection.requests.updateOne({
        _id: { operation: hash, request: requestHash },
      }, {
        $inc: { n: 1 },
        $set: { '_meta.lastSeen': new Date() },
        $setOnInsert: {
          _id: { operation: hash, request: requestHash },
          '_meta.firstSeen': new Date(),
          ...data.request,
        },
      }, { upsert: true }),
    ]);

    return data;
  }
}

/**
 * @typedef {import("apollo-server-types").BaseContext} BaseContext
 * @typedef {import("apollo-server-types")
 * .GraphQLRequestContextWillSendResponse<BaseContext>} GraphQLRequestContextWillSendResponse
 */

module.exports = new GraphQLOperationLogger({
  url: process.env.MONGO_URL_GRAPHQL_LOGGING,
});
