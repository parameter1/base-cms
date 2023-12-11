const debug = require('debug')('content-meter');
const parser = require('ua-parser-js');
const Joi = require('@parameter1/joi');
const { validate } = require('@parameter1/joi/utils');
const { asyncRoute, isFunction } = require('@parameter1/base-cms-utils');
const { content: loader } = require('@parameter1/base-cms-web-common/page-loaders');
const { get, getAsArray } = require('@parameter1/base-cms-object-path');
const buildContentInput = require('@parameter1/base-cms-marko-web/utils/build-content-input');
const queryFragment = require('../graphql/fragments/content-meter');

const configSchema = Joi.object({
  enabled: Joi.boolean().default(false)
    .description('Should content metering be enabled?'),
  viewLimit: Joi.number().min(0).default(3)
    .description('The number of views allowed within the timeframe before restricting access.'),
  timeframe: Joi.number().min(0).default(30 * 24 * 60 * 60 * 1000) // 30 days
    .description('Milliseconds to consider content accesses within.'),
  excludeLabels: Joi.array().items(Joi.string())
    .description('Content labels that should be excluded from metering.'),
  excludeContentTypes: Joi.array().items(Joi.string())
    .description('Content types that should be excluded from metering.'),
  excludePrimarySectionIds: Joi.array().items(Joi.number())
    .description('Sections whose primary content should be excluded from metering.'),
  excludePrimarySectionAlias: Joi.array().items(Joi.string())
    .description('Sections whose primary content should be excluded from metering.'),
  displayOverlay: Joi.boolean().default(false)
    .description('If the metering overlay should be displayed.'),
  promoCode: Joi.string().default('registration_meter')
    .description('If present, the Omeda promo code to use with content metering events.'),
});

const cookieName = 'contentMeter';
const now = new Date().getTime();
const { error } = console;

const defaultRegFn = ({ content }) => get(content, 'userRegistration.isCurrentlyRequired', false);
const shouldMeter = async (req, config) => {
  const { apollo, params } = req;
  const { id } = params;
  const additionalInput = buildContentInput({ req });
  // @todo error handling!
  const content = await loader(apollo, { id, additionalInput, queryFragment });
  if (!content) return false;

  // Check for local contentGatingHandler and use it or use the defaultRegFn
  const localFn = req.app.locals.contentGatingHandler;
  // Get the globally avaiable one if set and is function
  const contentGatingHandler = (localFn && isFunction(localFn)) ? localFn : defaultRegFn;
  // bypass if content is already gated by reg of some sort
  if (contentGatingHandler({ content })) {
    return false;
  }

  // excludeContentTypes: Excludes content metering on page if type matches exclusions
  if (getAsArray(config, 'excludeContentTypes').includes(content.type)) {
    return false;
  }
  // excludePrimarySectionIds: Excludes content metering on page that matches primarySection
  if (getAsArray(config, 'excludePrimarySectionIds').includes(content.primarySection.id)) {
    return false;
  }
  // excludePrimarySectionAliass: Excludes content metering on page that matches primarySection
  if (getAsArray(config, 'excludePrimarySectionAliass').includes(content.primarySection.alias)) {
    return false;
  }
  // excludeLabels: Excludes content metering on page that matches labels
  if (getAsArray(config, 'excludeLabels').some((r) => getAsArray(content, 'labels').includes(r))) {
    return false;
  }
  return true;
};

const hasOmedaId = ({ query, cookies }) => {
  const getOmedaId = (value) => {
    if (!value) return null;
    const trimmed = `${value}`.trim();
    return /^[a-z0-9]{15}$/i.test(trimmed) ? trimmed : null;
  };
  const idFromQuery = getOmedaId(query.oly_enc_id);
  const idFromCookie = cookies.oly_enc_id ? getOmedaId(cookies.oly_enc_id.replace(/^"/, '').replace(/"$/, '')) : undefined;
  return Boolean(idFromQuery || idFromCookie);
};

/**
 * Installs the configured content metering handler in the Express app instance.
 * To utilize, chain this middleware on a content route.
 */
module.exports = (params = {}) => asyncRoute(async (req, res, next) => {
  const config = validate(configSchema, params);

  const { identityX, params: { id } } = req;
  const { enabled, viewLimit, timeframe } = config;

  if (!enabled) return next();

  if (!identityX) {
    error('IdentityX middleware must be loaded before content metering middleware!');
    return next();
  }
  const idxObj = { isEnabled: true, requiredAccessLevelIds: [] };
  const { isLoggedIn, requiresUserInput } = await identityX.checkContentAccess(idxObj);

  const bypassOmeda = hasOmedaId(req);
  const bypassQuery = ['1', 'true'].includes(get(req, 'query.bypassContentMetering'));
  const bypassFacebook = get(parser(req.headers['user-agent']), 'browser.name') === 'Facebook';
  const bypassPushdown = Boolean(get(res, 'locals.newsletterState.canBeInitiallyExpanded'));

  debug({
    config,
    isLoggedIn,
    requiresUserInput,
    bypassOmeda,
    bypassQuery,
    bypassFacebook,
    bypassPushdown,
  });

  // Facebook UA or query parameter present
  if (bypassQuery || bypassFacebook) return next();
  // Logged in and all required fields are present.
  if (isLoggedIn && !requiresUserInput) return next();
  // Not logged in, but identified.
  if (!isLoggedIn && bypassOmeda) return next();

  res.locals.contentMeterState = {
    ...config,
    isLoggedIn,
    requiresUserInput,
    displayGate: false,
    displayOverlay: true,
  };

  // Fall back to inline gate form for user data collection
  if (isLoggedIn && requiresUserInput) return next();

  const shouldShowMeter = await shouldMeter(req, config);

  debug({ shouldShowMeter });

  if (shouldShowMeter) {
    const hasCookie = Boolean(get(req, `cookies.${cookieName}`));
    const value = (hasCookie) ? JSON.parse(get(req, `cookies.${cookieName}`)) : [];
    let valid = value.filter((pageView) => pageView.viewed > now - timeframe);

    if (valid.find((v) => v.id === id)) {
      valid = valid.map((pageview) => {
        const { id: viewId } = pageview;
        if (viewId === id) return { id, viewed: now };
        return pageview;
      });
    } else if (valid.length < viewLimit) {
      valid.push({ id, viewed: now });
    }

    const displayOverlay = (valid.length >= viewLimit && !valid.find((v) => v.id === id));

    res.locals.contentMeterState = {
      ...res.locals.contentMeterState,
      views: valid.length,
      displayGate: !bypassPushdown,
      displayOverlay,
    };
    res.cookie(cookieName, JSON.stringify(valid), { maxAge: timeframe });
  }
  return next();
});
