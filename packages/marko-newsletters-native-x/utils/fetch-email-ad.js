const { isObject } = require('@parameter1/base-cms-utils');
const { URLSearchParams } = require('url');
const fetch = require('node-fetch');
const createHeaders = require('./create-headers');

module.exports = async ({
  uri,
  placementId,
  timestamp,
  imageOptions,
  logoOptions,
  opts,
  req,
} = {}) => {
  const params = new URLSearchParams({
    ...(typeof timestamp === 'number' && { timestamp }),
    ...(isObject(imageOptions) && { imageOptions: JSON.stringify(imageOptions) }),
    ...(isObject(logoOptions) && { advertiserLogoOptions: JSON.stringify(logoOptions) }),
    ...(isObject(opts) && { opts: JSON.stringify(opts) }),
  });
  const query = `${params}`;
  const url = `${uri}/email-placement/${placementId}.json${query ? `?${query}` : ''}`;
  const response = await fetch(url, { headers: createHeaders({ req }) });
  const json = await response.json();
  if (!response.ok) {
    const err = new Error(response.statusMessage);
    err.statusCode = response.statusText;
    err.body = json;
    throw err;
  }
  return json;
};
