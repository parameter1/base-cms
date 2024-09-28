const { ApolloServer } = require('apollo-server-express');
const { get } = require('@parameter1/base-cms-object-path');
const { getFromRequest } = require('@parameter1/base-cms-tenant-context');
const { Router } = require('express');
const { isObject } = require('@parameter1/base-cms-utils');
const { requestParser: canonicalRules } = require('@parameter1/base-cms-canonical-path');
const ApolloNewrelicExtension = require('apollo-newrelic-extension');
const createAuthContext = require('../auth-context/create');
const createUserService = require('../user/create');
const createBaseRestClient = require('../create-rest-client');
const newrelic = require('../newrelic');
const basedbFactory = require('../basedb');
const createLoaders = require('../dataloaders');
const schema = require('../graphql/schema');
const loadSiteContext = require('../site-context/load');
const createCacheLoaders = require('../cache-loaders');
const {
  GRAPHQL_ENDPOINT,
  NEW_RELIC_ENABLED,
  GRAPHQL_CACHE_CONTROL_ENABLED,
  GRAPHQL_DEBUG_ENABLED,
  GRAPHQL_INTROSPECTION_ENABLED,
  GRAPHQL_PLAYGROUND_ENABLED,
  GRAPHQL_TRACING_ENABLED,
} = require('../env');
const RedisCacheGraphQLPlugin = require('../graphql/plugins/redis-cache');
const operationLoggerPlugin = require('../graphql/plugins/operation-logger');

/**
 * @callback LoadFnCallback
 * @param {string} loader
 * @param {*} id
 * @param {object} projection
 * @param {object} [criteria={}]
 */
/**
 * @typedef CanonicalRule
 * @prop {string} prefix
 * @prop {string} parts
 */
/**
 * @typedef GraphQLServerContext
 * @prop {import("../auth-context/context")} auth
 * @prop {import("@parameter1/base-cms-base4-rest-api").Base4RestApiClient} base4rest
 * @prop {import("@parameter1/base-cms-db").BaseDB} basedb
 * @prop {import("../cache-loaders/index")} cacheLoaders
 * @prop {Object.<string, CanonicalRule>} canonicalRules
 * @prop {LoadFnCallback} load
 * @prop {string} requestId
 * @prop {import("../site-context")} site
 * @prop {string} tenant
 * @prop {import("../user/user-service")} userService
 */

const { keys } = Object;
const router = Router();

const config = {
  tracing: GRAPHQL_TRACING_ENABLED,
  cacheControl: GRAPHQL_CACHE_CONTROL_ENABLED,
  extensions: [
    ...(NEW_RELIC_ENABLED ? [() => new ApolloNewrelicExtension()] : []),
  ],
  introspection: GRAPHQL_INTROSPECTION_ENABLED,
  debug: GRAPHQL_DEBUG_ENABLED,
  playground: GRAPHQL_PLAYGROUND_ENABLED ? { endpoint: GRAPHQL_ENDPOINT } : false,
};

const server = new ApolloServer({
  schema,
  ...config,
  /**
   * @returns {GraphQLServerContext}
   */
  context: async ({ req }) => {
    const { body } = req;
    const { tenant, siteId } = getFromRequest(req);
    const dbContext = {
      requestId: req.id,
      type: 'Apollo GraphQL Request',
      clientName: req.get('apollographql-client-name'),
      clientVersion: req.get('apollographql-client-version'),
      operationName: body.operationName,
      variables: body.variables,
    };
    const basedb = basedbFactory(tenant, dbContext);
    const loaders = createLoaders(basedb);
    const cacheLoaders = createCacheLoaders({
      basedb,
      onCacheError: newrelic.noticeError.bind(newrelic),
    });

    // Load the (optional) site context from the database.
    const site = await loadSiteContext({
      siteId,
      basedb,
      tenant,
      enableCache: req.get('x-cache-site-context') !== 'false',
    });

    // Load the (optional) Base4 REST API client.
    // Some GraphQL mutations require this.
    const base4rest = createBaseRestClient({ uri: req.get('x-base4-api-uri') });

    // Create the auth context for use with the requires-auth directive.
    const userService = createUserService({ basedb });
    const auth = await createAuthContext({ req, userService });

    return {
      req,
      requestId: req.id,
      tenant,
      basedb,
      base4rest,
      site,
      auth,
      userService,
      cacheLoaders,
      load: async (loader, id, projection, criteria = {}) => {
        if (!loaders[loader]) throw new Error(`No dataloader found for '${loader}'`);

        const query = isObject(criteria) ? criteria : {};
        const queryKeys = keys(query);
        const sortedQuery = queryKeys.sort().reduce((o, key) => ({ ...o, [key]: query[key] }), {});

        const fieldKeys = isObject(projection) ? keys({ ...projection, _id: 1 }) : [];
        // Need to also project by any query fields.
        const sortedFields = fieldKeys.concat(queryKeys).sort();

        return loaders[loader].load([
          id,
          sortedFields.length ? sortedFields : null,
          queryKeys.length ? sortedQuery : null,
        ]);
      },
      canonicalRules: canonicalRules(req),
    };
  },
  formatError: (e) => {
    const code = get(e, 'extensions.code');
    if (code === 'INTERNAL_SERVER_ERROR') newrelic.noticeError(e);
    return e;
  },
  plugins: [
    new RedisCacheGraphQLPlugin({ onCacheError: newrelic.noticeError.bind(newrelic) }),
    operationLoggerPlugin(),
  ],
});
server.applyMiddleware({ app: router, path: GRAPHQL_ENDPOINT });

module.exports = router;
