/* eslint-disable import/no-dynamic-require, global-require */
require('@parameter1/base-cms-marko-node-require');
const http = require('http');
const path = require('path');
const { createTerminus } = require('@godaddy/terminus');
const { isFunction: isFn, parseBooleanHeader } = require('@parameter1/base-cms-utils');
const { getAsObject } = require('@parameter1/base-cms-object-path');

const { env } = process;
if (!process.env.LIVERELOAD_PORT) process.env.LIVERELOAD_PORT = 4010;
if (!process.env.EXPOSED_HOST) process.env.EXPOSED_HOST = env.HOST || 'localhost';

process.on('unhandledRejection', (e) => { throw e; });

const wait = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

module.exports = async ({
  rootDir,
  siteConfig,
  coreConfig,
  helmetConfig,
  host = env.HOST,
  port = env.PORT || 4008,
  exposedPort = env.EXPOSED_PORT || env.PORT || 4008,
  exposedHost = env.EXPOSED_HOST,
  routes,
  errorTemplate,
  document, // custom marko-web-document component
  components, // components to register globally (e.g. for load more, etc)
  fragments, // fragments to register globally
  embeddedMediaHandlers,
  onAsyncBlockError,
  onFatalError,
  redirectHandler,
  sitemapsHeaders,

  // Cache settings.
  gqlCacheResponses = parseBooleanHeader(env.CACHE_GQL_RESPONSES),
  gqlCacheSiteContext = parseBooleanHeader(env.CACHE_GQL_SITE_CONTEXT),

  // Terminus settings.
  timeout = 1000,
  signals = ['SIGTERM', 'SIGINT', 'SIGHUP', 'SIGQUIT'],
  healthCheckPath = '/_health',
  onSignal,
  onShutdown,
  onStart,
  beforeShutdown,
  onHealthCheck,
} = {}) => {
  if (!rootDir) throw new Error('The root project directory is required.');
  // load the site package file.
  const sitePackage = require(path.resolve(rootDir, 'package.json'));
  // load config from package `website` option but allow env values to override.
  const site = getAsObject(sitePackage, 'website');
  if (!process.env.TENANT_KEY && site.tenant) process.env.TENANT_KEY = site.tenant;
  if (!process.env.SITE_ID && site.id) process.env.SITE_ID = site.id;
  if (!process.env.GRAPHQL_URI && site.stack) process.env.GRAPHQL_URI = `https://graphql.${site.stack}.base.parameter1.com`;
  if (!process.env.OEMBED_URI && site.stack) process.env.OEMBED_URI = `https://oembed.${site.stack}.base.parameter1.com`;
  if (!process.env.RSS_URI && site.stack) process.env.RSS_URI = `https://rss.${site.stack}.base.parameter1.com`;
  if (!process.env.SITEMAPS_URI && site.stack) process.env.SITEMAPS_URI = `https://sitemaps.${site.stack}.base.parameter1.com`;

  // ensure core envs are set.
  ['TENANT_KEY', 'SITE_ID', 'GRAPHQL_URI', 'OEMBED_URI', 'RSS_URI', 'SITEMAPS_URI'].forEach((key) => {
    if (!process.env[key]) throw new Error(`The ${key} value must be set either from env or via the website package config.`);
  });

  // base browse (optional)
  if (!process.env.BASE_BROWSE_GRAPHQL_URI && site.stack) process.env.BASE_BROWSE_GRAPHQL_URI = `https://base-browse.${site.stack}.base.parameter1.com/graphql`;

  const graphqlUri = process.env.GRAPHQL_URI;
  const siteId = process.env.SITE_ID;
  const tenantKey = process.env.TENANT_KEY;
  const baseBrowseGraphqlUri = process.env.BASE_BROWSE_GRAPHQL_URI;

  // require core packages after env values have been processed so they are set when imported
  const errorHandlers = require('./express/error-handlers');
  const express = require('./express');
  const loadMore = require('./express/load-more');
  const disabledFeatures = require('./middleware/disabled-features');

  const app = express({
    rootDir,
    siteConfig,
    coreConfig,
    helmetConfig,
    graphqlUri,
    tenantKey,
    siteId,
    onAsyncBlockError,
    onFatalError,
    document,
    components,
    fragments,
    sitePackage,
    embeddedMediaHandlers,
    sitemapsHeaders,
    gqlCacheResponses,
    gqlCacheSiteContext,
    baseBrowseGraphqlUri,
  });

  app.use(disabledFeatures());

  // Await required services here...
  if (isFn(onStart)) await onStart(app);

  // Register load more after onStart to ensure userland middleware is available.
  loadMore(app);

  // Load website routes.
  if (!isFn(routes)) throw new Error('A routes function is required.');
  routes(app);

  // Apply error handlers.
  errorHandlers(app, {
    template: errorTemplate,
    redirectHandler,
    onFatalError: onFatalError || onAsyncBlockError,
  });

  const server = http.createServer(app);

  createTerminus(server, {
    timeout: env.TERMINUS_TIMEOUT || timeout,
    signals,
    // Add health checks of services here...
    healthChecks: {
      [healthCheckPath]: async () => {
        if (isFn(onHealthCheck)) return onHealthCheck();
        return { ping: 'pong' };
      },
    },
    onSignal: async () => {
      // Stop required services here...
      if (isFn(onSignal)) await onSignal();
    },
    onShutdown: async () => {
      if (isFn(onShutdown)) await onShutdown();
    },
    beforeShutdown: async () => {
      if (isFn(beforeShutdown)) await beforeShutdown();
      const { TERMINUS_SHUTDOWN_DELAY } = env;
      if (TERMINUS_SHUTDOWN_DELAY) await wait(TERMINUS_SHUTDOWN_DELAY);
    },
  });

  return new Promise((res, rej) => {
    server.listen(port, host, function listen(err) {
      if (err) {
        rej(err);
      } else {
        res(this);
        if (process.send) {
          process.send({
            event: 'ready',
            name: sitePackage.name,
            siteId,
            graphqlUri,
            baseBrowseGraphqlUri,
            location: `http://${exposedHost}:${exposedPort}`,
          });
        }
      }
    });
  }).catch((e) => setImmediate(() => { throw e; }));
};
