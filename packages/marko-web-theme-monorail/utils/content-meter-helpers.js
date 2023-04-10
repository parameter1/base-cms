const debug = require('debug')('content-meter');
const { get } = require('@parameter1/base-cms-object-path');
const { isFunction: isFn } = require('@parameter1/base-cms-utils');

const shouldOverlay = (contentMeterState) => {
  if (!contentMeterState) return false;
  if (!contentMeterState.displayOverlay) return false;
  if (!contentMeterState.isLoggedIn && !contentMeterState.displayGate) return false;
  if (contentMeterState.isLoggedIn) return false;
  return true;
};

const defaultHandler = ({ content }) => get(content, 'userRegistration.isCurrentlyRequired');

const restrictContentByReg = (contentMeterState, handler, content) => {
  if (!contentMeterState) return false;

  // If content is gated by reg return true all the time
  const contentReg = isFn(handler) ? handler({ content }) : defaultHandler({ content });
  if (contentReg === true) return true;

  const { isLoggedIn, requiresUserInput } = contentMeterState;
  const displayOverlay = shouldOverlay(contentMeterState);
  // if the overlay is displayed require reg
  if (displayOverlay) return true;
  // if the user is logged in but doesnt have the required fields display gate
  if (isLoggedIn && requiresUserInput) return true;

  return false;
};

const shouldTruncate = (contentMeterState) => {
  if (!contentMeterState) return false;

  const { isLoggedIn, requiresUserInput } = contentMeterState;
  const displayOverlay = shouldOverlay(contentMeterState);
  if (!displayOverlay) return false;
  if (isLoggedIn && !requiresUserInput) return false;
  return true;
};

module.exports = {
  shouldOverlay: (...args) => {
    const out = shouldOverlay(...args);
    debug('shouldOverlay', out, args);
    return out;
  },
  restrictContentByReg: (...args) => {
    const out = restrictContentByReg(...args);
    debug('restrictContentByReg', out);
    return out;
  },
  shouldTruncate: (...args) => {
    const out = shouldTruncate(...args);
    debug('shouldTruncate', out);
    return out;
  },
};
