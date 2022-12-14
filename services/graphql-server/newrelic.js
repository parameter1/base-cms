/**
 * New Relic agent configuration.
 *
 * See lib/config/default.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
exports.config = {
  /**
   * Array of application names.
   */
  app_name: ['basecms/graphql-server'],
  /**
   * Your New Relic license key.
   */
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  logging: {
    /**
     * Level at which to log. 'trace' is most useful to New Relic when diagnosing
     * issues with the agent, 'info' and higher will impose the least overhead on
     * production applications.
     */
    level: 'info',
  },
  /**
   *  Alias that should be ignored by New Relic.
   */
  rules: {
    ignore: [/^\/_health$/],
  },
  /**
   * When true, all request headers except for those listed in attributes.exclude
   * will be captured for all traces, unless otherwise specified in a destination's
   * attributes include/exclude lists.
   */
  allow_all_headers: true,
  attributes: {
    /**
     * Prefix of attributes to exclude from all destinations. Allows * as wildcard
     * at end.
     *
     * NOTE: If excluding headers, they must be in camelCase form to be filtered.
     *
     * @env NEW_RELIC_ATTRIBUTES_EXCLUDE
     */
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.proxyAuthorization',
      'request.headers.setCookie*',
      'request.headers.x*',
      'response.headers.cookie',
      'response.headers.authorization',
      'response.headers.proxyAuthorization',
      'response.headers.setCookie*',
      'response.headers.x*',
    ],
  },

  transaction_events: {
    max_samples_stored: parseInt(process.env.NEW_RELIC_TRANSACTION_EVENTS_MAX_SAMPLES_STORED, 10)
      || 10000,
  },

  custom_insights_events: {
    enabled: ['0', 'false', 0, false].includes(process.env.NEW_RELIC_CUSTOM_INSIGHTS_EVENTS_ENABLED)
      ? false : true, // eslint-disable-line no-unneeded-ternary
  },

  plugins: {
    native_metrics: {
      enabled: ['0', 'false', 0, false].includes(process.env.NEW_RELIC_PLUGINS_NATIVE_METRICS_ENABLED)
        ? false : true, // eslint-disable-line no-unneeded-ternary
    },
  },
};
