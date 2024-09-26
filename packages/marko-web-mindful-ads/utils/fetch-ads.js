const fetch = require('node-fetch');
const logger = require('./logger');

const { error } = console;
const host = process.env.MINDFUL_ADVERTISING_DELIVERY_API_URL || 'https://delivery.mindfulcms.com';

/**
 * @param MindfulWebsiteBannerRequestArgs
 * @returns {Promise<MindfulWebsiteBannerResponse[]>}
 */
module.exports = async ({
  adUnitId,
  advertiserIds = [],
  debug = true,
  limit = 1,
  sizes = [],
  namespace,
} = {}) => {
  if (!namespace) throw new Error('Mindful namespace must be supplied.');
  if (!adUnitId) throw new Error('Mindful ad unit id must be supplied.');
  const log = logger(debug);
  log({
    adUnitId,
    advertiserIds,
    limit,
    sizes,
    namespace,
  });
  try {
    const url = new URL(`${host}/${namespace}/website-banner/${adUnitId}`);
    url.searchParams.set('limit', limit);
    sizes.forEach((size) => url.searchParams.append('sizes', size));
    advertiserIds.forEach((id) => url.searchParams.append('advertiserIds', id));
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Unable to retrieve mindful ads: ${res.status} ${res.statusText}`);
    return res.json();
  } catch (e) {
    error('Unable to retrieve mindful ads!', e);
    return { error: e };
  }
};

/**
 * @typedef MindfulWebsiteBannerRequestArgs
 * @prop {string} namespace The Mindful namespace (tenant/workspace keys)
 * @prop {string[]} advertiserIds
 * @prop {string} adUnitId
 * @prop {boolean} debug
 * @prop {string[]} sizes
 *
 * @typedef MindfulWebsiteBannerAdUnit
 * @prop {string} _id
 * @prop {string[]} sizes
 * @prop {string} name
 * @prop {MindfulWebsiteChannel} websiteChannel
 *
 * @typedef MindfulWebsiteChannel
 * @prop {string} _id
 * @prop {string} name
 *
 * @typedef MindfulAdvertisingOrder
 * @prop {string} _id
 * @prop {string} name
 *
 * @typedef MindfulAdvertisingCompany
 * @prop {string} _id
 * @prop {string} name
 *
 * @typedef MindfulWebsiteBannerCreative
 * @prop {string} _id
 * @prop {string} form
 * @prop {string} kind
 * @prop {number} width
 * @prop {number} height
 * @prop {string} clickUrl
 * @prop {string} src
 * @prop {MindfulWebsiteBannerLineItem} lineItem
 * @prop {MindfulAdvertisingOrder} order
 * @prop {MindfulAdvertisingCompany} company
 *
 * @typedef MindfulWebsiteBannerResponse
 * @prop {MindfulWebsiteBannerAdUnit} unit
 * @prop {number} limit
 * @prop {string[]} sizes
 * @prop {MindfulWebsiteBannerCreative[]} results
 *
 */
