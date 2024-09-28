const { createMongoClient } = require('@parameter1/base-cms-db');
const { print } = require('graphql');
const { createHash } = require('crypto');
const hashObject = require('object-hash');

const sha256 = (value) => createHash('sha256').update(value).digest('hex');

function objectDeepKeys(obj) {
  return Object
    .keys(obj)
    .filter((key) => obj[key] instanceof Object && !Array.isArray(obj[key]))
    .map((key) => objectDeepKeys(obj[key]).map((k) => `${key}.${k}`))
    .reduce((x, y) => x.concat(y), Object.keys(obj));
}

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

    const { headers } = context.req;

    const client = headers['apollographql-client-name'] || '(none)';
    const config = (() => {
      try {
        return JSON.parse(process.env.GRAPHQL_LOGGER_CONFIG);
      } catch (e) {
        return {};
      }
    })();

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
        headers: Object.keys(headers).sort().reduce((o, k) => ({
          ...o,
          [k]: headers[k],
        }), {}),
        ip: context.req.ip,
        variables: request.variables || null,
      },
    };

    const collection = {
      fragments: await this.collection('fragments'),
      operations: await this.collection('operations'),
      requests: await this.collection('requests'),
      variables: await this.collection('variables'),
    };

    const hash = sha256([data.operation.hash, ...fragments.map((frag) => frag.hash)].join());
    const requestHash = sha256(JSON.stringify(data.request));
    const variableHash = hashObject(data.request.variables || {});
    const variableKeys = objectDeepKeys(request.variables || {}).sort();

    const selectionNames = operation.selectionSet.selections.map((selection) => (selection.name ? selection.name.value : '(none)'));

    await Promise.all([
      fragments.length ? collection.fragments.bulkWrite(fragments.map((frag) => ({
        updateOne: {
          filter: { _id: frag.hash },
          update: {
            $addToSet: {
              clients: client,
              environments: data.request.environment,
              operations: hash,
              operationNames: operationName || '(none)',
              selections: { $each: selectionNames },
            },
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
        $addToSet: {
          clients: client,
          environments: data.request.environment,
          variables: variableKeys,
        },
        $inc: { n: 1 },
        $set: { '_meta.lastSeen': new Date() },
        $setOnInsert: {
          _id: hash,
          '_meta.firstSeen': new Date(),
          ...data.operation,
          fragments: data.fragments,
        },
      }, { upsert: true }),
      !config.disableRequests ? collection.requests.updateOne({
        _id: { operation: hash, request: requestHash },
      }, {
        $inc: { n: 1 },
        $set: { '_meta.lastSeen': new Date() },
        $setOnInsert: {
          _id: { operation: hash, request: requestHash },
          '_meta.firstSeen': new Date(),
          ...data.request,
        },
      }, { upsert: true }) : Promise.resolve(),
      data.request.variables ? collection.variables.updateOne({
        _id: variableHash,
      }, {
        $addToSet: {
          clients: client,
          operations: hash,
          operationNames: operationName || '(none)',
          environments: data.request.environment,
          selections: { $each: selectionNames },
        },
        $inc: { n: 1 },
        $set: { '_meta.lastSeen': new Date() },
        $setOnInsert: {
          _id: variableHash,
          '_meta.firstSeen': new Date(),
          keys: variableKeys,
          variables: data.request.variables,
        },
      }, { upsert: true }) : Promise.resolve(),
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
