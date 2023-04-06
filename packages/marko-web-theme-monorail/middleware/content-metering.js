const debug = require('debug')('content-meter');
const parser = require('ua-parser-js');
const { asyncRoute } = require('@parameter1/base-cms-utils');
const { content: loader } = require('@parameter1/base-cms-web-common/page-loaders');
const { get, getAsArray } = require('@parameter1/base-cms-object-path');
const buildContentInput = require('@parameter1/base-cms-marko-web/utils/build-content-input');
const queryFragment = require('../graphql/fragments/content-meter');

const cookieName = 'contentMeter';
const now = new Date().getTime();
const { error } = console;

const shouldMeter = async (req, config) => {
  const { apollo, params } = req;
  const { id } = params;
  const additionalInput = buildContentInput({ req });
  // @todo error handling!
  const content = await loader(apollo, { id, additionalInput, queryFragment });
  if (!content) return false;

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
module.exports = asyncRoute(async (req, res, next) => {
  const { app, identityX, params: { id } } = req;
  const config = app.locals.site.getAsObject('contentMeter');
  const viewLimit = get(config, 'viewLimit', 3);
  const timeframe = get(config, 'timeframe', 30 * 24 * 60 * 60 * 1000); // 30 days

  if (!get(config, 'enabled', false)) return next();

  if (!identityX) {
    error('IdentityX middleware must be loaded before content metering middleware!');
    return next();
  }
  const idxObj = { isEnabled: true, requiredAccessLevelIds: [] };
  const { isLoggedIn, requiresUserInput } = await identityX.checkContentAccess(idxObj);

  const bypassOmeda = hasOmedaId(req);
  const bypassQuery = ['1', 'true'].includes(get(req, 'query.bypassContentMetering'));
  const bypassFacebook = parser(req.headers['user-agent']).browser.name === 'Facebook';
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
    } else if (valid.length <= viewLimit) {
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
