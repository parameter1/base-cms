const { asyncRoute } = require('@parameter1/base-cms-utils');
const { get } = require('@parameter1/base-cms-object-path');
const olyticsCookie = require('@parameter1/base-cms-marko-web-omeda/olytics/customer-cookie');
const { getResponseCookies } = require('@parameter1/base-cms-utils');
const query = require('../api/queries/customer-by-encrypted-id');

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {String|null}
 */
const findOlyticsId = (req, res) => {
  // Read from request cookies
  const reqId = olyticsCookie.parseFrom(req);
  if (reqId) return reqId;
  // request query param
  const { oly_enc_id: qId } = req.query;
  if (qId && olyticsCookie.clean(qId)) return olyticsCookie.clean(qId);
  // response cookie
  const cookies = getResponseCookies(res);
  const resId = olyticsCookie.parseFrom({ cookies });
  return resId;
};

/**
 * @typedef OIDXRequest
 * @prop {import('@parameter1/omeda-graphql-client')} $omedaGraphQLClient
 * @prop {import('@parameter1/base-cms-marko-web-identity-x/service')} identityX
 *
 * @typedef MiddlewareConstructor
 * @prop {string} brandKey              The Omeda Brand Key (tenant identifier).
 * @prop {boolean} createFromIdentity   If true, create the app user and set identity's external id.
 * @prop {boolean} enabled              If false, don't perform any identity cookie management.
 *
 * @param {MiddlewareConstructor}
 */
module.exports = ({
  brandKey,
  createFromIdentity = true,
  enabled = true,
}) => asyncRoute(async (req, res, next) => {
  if (!enabled) return next();

  /** @type {OIDXRequest} */
  const { identityX: idx, $omedaGraphQLClient: omeda } = req;
  const cookie = idx.getIdentity(res);

  // Don't overwrite an existing cookie
  if (cookie) return next();

  // get oly enc id. if we don't have one, bail
  const omedaId = findOlyticsId(req, res);
  if (!omedaId) return next();

  // Look up idx user by encrypted id
  const namespace = { provider: 'omeda', tenant: brandKey.toLowerCase(), type: 'customer' };
  const identity = await idx.findUserByExternalId({ identifier: omedaId, namespace });
  if (identity) {
    idx.setIdentityCookie(identity.id);
    return next();
  }

  // If disabled, don't create a user from the incoming identity.
  if (!createFromIdentity) return next();

  const or = await omeda.query({ query, variables: { id: omedaId } });
  const email = get(or, 'data.customerByEncryptedId.primaryEmailAddress.emailAddress');
  if (email) {
    // Upsert the user and add the external id to it.
    const { id } = await idx.createAppUser({ email });
    await idx.addExternalUserId({
      userId: id,
      identifier: { value: omedaId, type: 'encrypted' },
      namespace,
    });
    idx.setIdentityCookie(id);
    return next();
  }
  return next();
});
