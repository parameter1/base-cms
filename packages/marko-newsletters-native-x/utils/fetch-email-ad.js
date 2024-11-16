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
  debug,
} = {}) => {
  const params = new URLSearchParams({
    ...(typeof timestamp === 'number' && { timestamp }),
    ...(isObject(imageOptions) && { imageOptions: JSON.stringify(imageOptions) }),
    ...(isObject(logoOptions) && { advertiserLogoOptions: JSON.stringify(logoOptions) }),
    ...(isObject(opts) && { opts: JSON.stringify(opts) }),
  });
  const query = `${params}`;
  const url = `${uri}/${placementId}.json${query ? `?${query}` : ''}`;
  if (debug) console.log(url);
  const response = await fetch(url, { headers: createHeaders({ req }) });
  const json = await response.json();
  if (!response.ok) {
    const err = new Error(response.statusMessage);
    err.statusCode = response.statusText;
    err.body = json;
    throw err;
  }
  const regex = /^\s+<p/;
  if (json.data && Array.isArray(json.data) && json.data.length) {
    const results = {
      ...json,
      data: json.data.map((node) => ({
        ...node,
        ...(node.creative && {
          creative: {
            ...node.creative,
            ...(node.creative.teaser && !regex.test(node.creative.teaser) && {
              teaser: `<p>${node.creative.teaser}</p>`,
            }),
          },
        }),
      })),
    };
    return results;
  }
  if (json.data && json.data.creative) {
    const results = {
      ...json,
      data: {
        ...json.data,
        creative: {
          ...json.data.creative,
          ...(json.data.creative.teaser && !regex.test(json.data.creative.teaser) && {
            teaser: `<p>${json.data.creative.teaser}</p>`,
          }),
        },
      },
    };
    return results;
  }
  return json;
};
