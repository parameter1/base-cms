const fetch = require('node-fetch');
const { getAsArray } = require('@parameter1/base-cms-object-path');
const logger = require('./logger');
const buildQuery = require('./build-query');

/**
 * @typedef MindfulNativeEmailCreativeDeliveryArgs
 * @prop {string} namespace The Mindful namespace
 * @prop {ObjectID} adUnitId
 * @prop {boolean} debug
 * @prop {Date} day
 * @prop {AdvertisingImageRenderingSettingsInput} imageOptions
 * @prop {AdvertisingImageRenderingSettingsInput} logoOptions
 * @prop {MindfulNativeEmailLabels} labels
 *
 * @template {Object.<string, any>} MindfulNativeEmailLabels
 *
 * @typedef AdvertisingImageRenderingSettingsInput
 * @prop {string} ar
 * @prop {AdvertisingImageAutoEnum[]} auto
 * @prop {AdvertisingImageRenderingSettingsColorInput} bg
 * @prop {boolean} bgRemove
 * @prop {number} bri Int
 * @prop {number} con Int
 * @prop {AdvertisingImageCropEnum} crop
 * @prop {number} exp Int
 * @prop {number} facepad Float
 * @prop {AdvertisingImageFillEnum} fill
 * @prop {AdvertisingImageRenderingSettingsColorInput} fillColor
 * @prop {AdvertisingImageFitEnum} fit
 * @prop {AdvertisingImageFlipEnum} flip
 * @prop {boolean} fpDebug
 * @prop {number} fpX Float
 * @prop {number} fpY Float
 * @prop {number} fpZ Float
 * @prop {number} gam Int
 * @prop {number} h Int
 * @prop {number} maxW Int
 * @prop {AdvertisingImageOrientEnum} orient
 * @prop {object} other
 * @prop {number} pad Int
 * @prop {number} q Int
 * @prop {AdvertisingImageRenderingSettingsRectangleInput} rect
 * @prop {number} sat Int
 * @prop {number} vib Int
 * @prop {number} w Int
 *
 * @typedef AdvertisingImageRenderingSettingsRectangleInput
 * @prop {number} height Int!
 * @prop {number} width Int!
 * @prop {number} x Float!
 * @prop {number} y Float!
 *
 * @typedef {("_180"|"_270"|"_90")} AdvertisingImageOrientEnum
 * @typedef {
*  ("CLAMP"|"CLIP"|"CROP"|"FACEAREA"|"FILL"|"FILLMAX"|"MAX"|"MIN"|"SCALE")
* } AdvertisingImageFitEnum
* @typedef {("BLUR"|"SOLID")} AdvertisingImageFillEnum
* @typedef {
*  ("BOTTOM"|"EDGES"|"ENTROPY"|"FACES"|"FOCALPOINT"|"LEFT"|"RIGHT"|"TOP")
* } AdvertisingImageCropEnum
*
* @typedef AdvertisingImageRenderingSettingsColorInput
* @prop {number} a Float, RGBA alpha value
* @prop {number} r Int, RGBA red value
* @prop {number} g Int, RGBA green value
* @prop {number} b Int, RGBA blue value
*
* @typedef MindfulNativeEmailName
* @prop {string} default
*
* @typedef MindfulNativeEmailCreative
* @prop {string} _id
* @prop {MindfulNativeEmailName} name
* @prop {string} clickUrl
* @prop {string} linkText
* @prop {string} teaser
* @prop {ImageEdge} imageEdge
* @prop {LineItemEdge} lineitemEdge
* @prop {CompanyEdge} companyEdge
*
*/
const url = process.env.MINDFUL_QUERY_API_URL || 'https://graphql.mindfulcms.com/query';

/**
 * @param MindfulNativeEmailCreativeDeliveryArgs
 * @returns {Promise<MindfulNativeEmailCreative[]>}
 */
module.exports = async ({
  adUnitId,
  debug = false,
  limit = 1,
  imageOptions = {},
  labels = {},
  logoOptions = {},
  namespace,
  day,
} = {}) => {
  const log = logger(debug);
  log({
    adUnitId,
    limit,
    imageOptions,
    labels,
    logoOptions,
    namespace,
    day,
  });

  const query = buildQuery(labels);

  const variables = {
    adUnitId,
    day,
    imageOptions,
    logoOptions,
    limit,
  };

  // Hit Query API with adunit and date
  const headers = {
    'content-type': 'application/json',
    'x-namespace': namespace,
  };
  const body = JSON.stringify({ query, variables });
  log({ headers, body, query });
  const res = await fetch(url, { method: 'post', headers, body });
  const obj = await res.json();
  log(obj);
  const msgs = getAsArray(obj, 'errors').map((e) => e.message).join(',');
  if (!res.ok || msgs.length) throw new Error(`Unable to retrieve native email ad: ${msgs || res.statusText}`);
  return getAsArray(obj, 'data.deliverNativeEmailAdvertisingCreatives');
};
