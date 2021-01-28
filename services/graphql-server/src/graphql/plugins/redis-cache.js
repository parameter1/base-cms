const { createHash } = require('crypto');
const { parseBooleanHeader } = require('@parameter1/base-cms-utils');
const redis = require('../../redis');

/**
 *
 * @param {GraphQLRequestContext} requestContext
 */
const isGraphQLQuery = (requestContext) => {
  const { operation } = requestContext;
  return operation && operation.operation === 'query';
};

/**
 *
 * @param {GraphQLRequestContext} requestContext
 */
const isIntrospectionQuery = (requestContext) => {
  const { operation } = requestContext;
  return operation.selectionSet.selections.every((selection) => {
    const fieldName = selection.name.value;
    return fieldName.startsWith('__');
  });
};

/**
 *
 * @param {object} obj The object to use to generate the key.
 */
const stringifyCacheKey = obj => createHash('sha256').update(JSON.stringify(obj)).digest('hex');

/**
 *
 * @param {string} tenant The tenant key. Is used in the key prefix.
 * @param {object} obj The object to use to generate the key.
 */
const createKey = (tenant, obj) => `base_gql:${tenant}:${stringifyCacheKey(obj)}`;

const setHeader = (http, key, value) => {
  if (http) http.headers.set(key, `${value}`);
};

/**
 * @todo Eventually this should adhere to `@cacheControl` directives.
 * @todo Adjust header-based cache enabling to hook function
 */
class RedisCacheGraphQLPlugin {
  /**
   *
   * @param {object} params
   * @param {boolean} [params.enabled=true] Whether cache is globally enabled
   * @param {function} [params.onCacheError] A function to invoke when a cache-set error is thrown.
   */
  constructor({ enabled = true, onCacheError } = {}) {
    this.enabled = enabled;
    this.redis = redis;
    this.onCacheError = onCacheError;
  }

  /**
   *
   */
  requestDidStart() {
    let cacheKeyObj;
    let cacheKey;
    let age;

    return {
      /**
       *
       * @param {GraphQLRequestContext} requestContext
       */
      responseForOperation: async (requestContext) => {
        if (!this.canCache(requestContext)) return null;
        const { context } = requestContext;

        cacheKeyObj = {
          source: requestContext.source, // the raw query source string
          operationName: requestContext.operationName, // the op name (if set)
          variables: { ...(requestContext.request.variables || {}) }, // all query vars
          context: { siteId: context.site.id() }, // specific context variables
        };

        cacheKey = createKey(context.tenant, cacheKeyObj);

        const serialized = await this.redis.get(cacheKey);
        if (!serialized) return null;

        const cacheValue = JSON.parse(serialized);
        // eslint-disable-next-line no-param-reassign
        requestContext.metrics.responseCacheHit = true;
        age = Math.round((Date.now() - cacheValue.cacheTime) / 1000);
        return { data: cacheValue.data };
      },

      /**
       *
       * @param {GraphQLRequestContext} requestContext
       */
      willSendResponse: (requestContext) => {
        if (!this.canCache(requestContext)) return;
        const { response } = requestContext;
        const { http } = response;
        const { responseCacheHit: hit } = requestContext.metrics;
        setHeader(http, 'x-cache', hit ? 'hit' : 'miss');

        if (hit) {
          // do not write cache for cached responses. but set the age header.
          if (age != null) setHeader(http, 'age', age);
          return;
        }

        const cacheValue = {
          data: response.data,
          cacheTime: Date.now(),
        };
        if (!cacheKey) throw new Error('Unable to get cache key from previous hook.');

        // set cache but do not await
        const { onCacheError } = this;
        redis.set(cacheKey, JSON.stringify(cacheValue), 'EX', 30).catch((e) => {
          if (typeof onCacheError === 'function') onCacheError(e);
        });
      },
    };
  }

  /**
   *
   * @param {GraphQLRequestContext} requestContext
   */
  canCache(requestContext) {
    if (!this.enabled) return false;
    const { request, response } = requestContext;
    const { http } = request;
    if (!http) return false;
    const cacheEnabled = parseBooleanHeader(http.headers.get('x-cache-responses'));
    if (!cacheEnabled) return false;
    const { errors } = response || {};
    return isGraphQLQuery(requestContext) && !isIntrospectionQuery(requestContext) && !errors;
  }
}

module.exports = RedisCacheGraphQLPlugin;
