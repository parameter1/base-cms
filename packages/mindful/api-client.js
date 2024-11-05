const debug = require('debug')('mindful:api');
const fetch = require('node-fetch');
const { get } = require('@parameter1/base-cms-object-path');
const GraphQLError = require('graphql');
const gql = require('graphql-tag');
const Joi = require('joi');

const { extractFragmentName, getOperationName } = require('./utils');

const schemas = {
  constructor: Joi.object({
    namespace: Joi.string().required(),
    url: Joi.string().allow(null, ''),
  }).required(),
};

/**
 * @typedef ConstructorParams
 * @prop {string} namespace
 * @prop {string} [url]
 */
class MindfulApiClient {
  /**
   *
   * @param {ConstructorParams} params
   */
  constructor(params) {
    /** @type {ConstructorParams} */
    const { namespace, url } = Joi.attempt(params, schemas.constructor);
    this.namespace = namespace;
    this.url = url || 'https://graphql.mindfulcms.com/query';
  }

  /**
   * @param {object} args
   * @param {string} args._id
   * @param {import("graphql").DocumentNode|string} fragment
   */
  async getAdvertisingPostById({ _id }, fragment) {
    const fragmentName = extractFragmentName({ fragment, throwOnEmpty: true });
    return this.query({
      query: gql`
        query GetAdvertisingPostById($_id: ObjectID!) {
          advertisingPostById(_id: $_id){
            ...${fragmentName}
          }
        }
        ${fragment}
      `,
      variables: { _id },
    });
  }

  /**
   * @param {object} args
   * @param {string} args._id
   * @param {string} args.provider
   * @param {string} args.tenant
   * @param {import("graphql").DocumentNode|string} fragment
   */
  async getAdvertisingPostByIdOrImportEntity(
    {
      _id,
      provider,
      tenant = 'native-x',
      type = 'story',
    },
    fragment,
  ) {
    const queryName = 'advertisingPostByIdOrImportEntity';
    const fragmentName = extractFragmentName({ fragment, throwOnEmpty: true });
    const query = gql`
    query GetAdvertisingPostByIdOrImportEntity($_id: ObjectID!, $provider: String!, $tenant: String!, $type: String!){
      ${queryName}(_id: $_id, provider: $provider, tenant: $tenant, type: $type){
        ...${fragmentName}
      }
    }
    ${fragment}
  `;
    return this.query({
      query,
      variables: {
        _id,
        provider,
        tenant,
        type,
      },
    });
  }

  /**
   * @param {object} params
   * @param {import("graphql").DocumentNode} params.query
   * @param {object} [params.variables]
   */
  async query({ query, variables }) {
    const { url, namespace } = this;
    const method = 'post';
    const headers = {
      'content-type': 'application/json',
      'x-namespace': namespace,
    };
    const body = JSON.stringify({
      operationName: getOperationName(query),
      variables,
      query: get(query, 'loc.source.body', query),
    });

    const r = await fetch(url, {
      method,
      headers,
      query,
      variables,
      body,
    });
    const res = await r.json();
    const dbg = {
      req: { url, ...{ method, headers, opts: { variables, query } } },
      res: { headers: r.headers.raw(), body: res },
    };
    if (!r.ok || res.errors) {
      debug(`${method.toUpperCase()} ${url} ${r.status} ERR`, dbg);
      throw new GraphQLError(r, res);
    }
    debug(`${method.toUpperCase()} ${url} ${r.status} OK`, dbg);
    return res;
  }
}

module.exports = { MindfulApiClient };
