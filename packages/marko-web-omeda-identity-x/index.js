const Joi = require('@parameter1/joi');
const { validate } = require('@parameter1/joi/utils');
const omeda = require('@parameter1/base-cms-marko-web-omeda');
const identityX = require('@parameter1/base-cms-marko-web-identity-x');
const addOmedaHooksToIdentityXConfig = require('./add-integration-hooks');
const setPromoSourceCookie = require('./middleware/set-promo-source');
const stripOlyticsParam = require('./middleware/strip-olytics-param');
const resyncCustomerData = require('./middleware/resync-customer-data');
const setOlyticsCookie = require('./middleware/set-olytics-cookie');
const setIdentityCookie = require('./middleware/set-identity-cookie');
const rapidIdentify = require('./middleware/rapid-identify');
const rapidIdentifyRouter = require('./routes/rapid-identify');
const props = require('./validation/props');
const schemas = require('./validation/schemas');

/**
 * @typedef {import('./validation/schemas/hook-behavior')
 *            .HookBehaviorSchema} HookBehaviorSchema
 * @typedef {import('./validation/schemas/hook-demographic')
 *            .HookDemographicSchema} HookDemographicSchema
 * @typedef {import('./validation/schemas/hook-promo-code')
 *            .HookPromoCodeSchema} HookPromoCodeSchema
 * @typedef {import('@parameter1/base-cms-marko-web-identity-x/config')} IdentityXConfig

 * @typedef OmedaIdentityXConfig
 * @prop {HookDemographicSchema[]} appendDemographicToHook
 * @prop {HookPromoCodeSchema[]} appendPromoCodeToHook
 * @prop {string} appId The Omeda Application Identifier
 * @prop {BehaviorSchema} behaviors
 * @prop {BehaviorAttributeSchema} behaviorAttributes
 * @prop {string} brandKey
 * @prop {string} clientKey
 * @prop {boolean} [createFromIdentity=true] createFromIdentity
 * @prop {HookBehaviorSchema[]} hookBehavior
 * @prop {IdentityXConfig} idxConfig
 * @prop {string} [idxOmedaRapidIdentifyProp=$idxOmedaRapidIdentify]
 * @prop {object} idxRouteTemplates
 * @prop {string} inputId
 * @prop {string} [omedaGraphQLClientProp=$omedaGraphQLClient]
 * @prop {string} [omedaPromoCodeCookieName=omeda_promo_code]
 * @prop {?string} omedaPromoCodeDefault
 * @prop {string} [omedaRapidIdentifyProp=$omedaRapidIdentify]
 * @prop {?ShouldAwaitSchema} shouldAwait
 * @prop {?Promise<object>} onLoginLinkSentFormatter
 * @prop {?Promise<object>} onAuthenticationSuccessFormatter
 * @prop {?Promise<object>} onUserProfileUpdateFormatter
 * @prop {number} rapidIdentProductId
 *
 * @typedef BehaviorSchema
 * @prop {number} logIn
 * @prop {number} verifyEmail
 * @prop {number} submitProfile
 *
 * @typedef BehaviorAttributeSchema
 * @prop {BehaviorAttributeWebsite} website
 * @prop {BehaviorAttributeActionSource} actionSource
 * @prop {BehaviorAttributeNewsletterSignupType} newsletterSignupType
 * @prop {BehaviorAttributeContentGateType} contentGateType
 *
 * @typedef BehaviorAttributeWebsite
 * @prop {number} id
 * @prop {number} valueId
 *
 * @typedef BehaviorAttributeActionSource
 * @prop {number} id
 * @prop {object} valueIds
 * @prop {number} valueIds.default
 * @prop {number} valueIds.newsletterSignup
 * @prop {number} valueIds.comments
 * @prop {number} valueIds.contentGate
 *
 * @typedef BehaviorAttributeContentGateType
 * @prop {number} id
 * @prop {object} valueIds
 * @prop {number} valueIds.default
 * @prop {number} valueIds.metered
 * @prop {number} valueIds.printPreview
 *
 * @typedef BehaviorAttributeNewsletterSignupType
 * @prop {number} id
 * @prop {object} valueIds
 * @prop {number} valueIds.default
 * @prop {number} valueIds.pushdown
 * @prop {number} valueIds.inlineContent
 * @prop {number} valueIds.inlineSection
 * @prop {number} valueIds.footer
 *
 * @typedef ShouldAwaitSchema
 * @prop {boolean} [onLoginLinkSent=false] onLoginLinkSent
 * @prop {boolean} [onAuthenticationSuccess=true] onAuthenticationSuccess
 * @prop {boolean} [onUserProfileUpdate=false] onUserProfileUpdate
 */

const defaultFormatter = async ({ payload }) => payload;

/**
 * @param {import('express').Application} app
 * @param {OmedaIdentityXConfig} params
 */
module.exports = (app, params = {}) => {
  const {
    appendBehaviorToHook,
    appendDemographicToHook,
    appendPromoCodeToHook,
    appId,
    behaviors,
    behaviorAttributes,
    brandKey,
    clientKey,
    createFromIdentity,
    idxConfig,
    idxOmedaRapidIdentifyProp,
    idxRouteTemplates,
    inputId,
    omedaGraphQLClientProp,
    omedaPromoCodeCookieName,
    omedaPromoCodeDefault,
    omedaRapidIdentifyProp,
    shouldAwait,
    onLoginLinkSentFormatter = defaultFormatter,
    onAuthenticationSuccessFormatter = defaultFormatter,
    onUserProfileUpdateFormatter = defaultFormatter,
    rapidIdentProductId,
  } = validate(Joi.object({
    appendBehaviorToHook: Joi.array().items(schemas.hookBehavior),
    appendDemographicToHook: Joi.array().items(schemas.hookDemographic),
    appendPromoCodeToHook: Joi.array().items(schemas.hookPromoCode),
    appId: Joi.string().required(),
    shouldAwait: schemas.shouldAwait,
    /**
     * Behavior config is now mandatory and can be generated by the CLI.
     * @see https://github.com/parameter1/identity-x-omeda-cli
     *  */
    behaviors: Joi.object({
      logIn: Joi.number().required(),
      verifyEmail: Joi.number().required(),
      submitProfile: Joi.number().required(),
    }).required(),
    behaviorAttributes: Joi.object({
      website: Joi.object({
        // The Omeda BehaviorAttribute ID for the `Parameter1 Website` attribute.
        id: Joi.number().required(),
        // The Omeda DefinedValue ID for the current website.
        valueId: Joi.number().required(),
      }).required(),
      actionSource: Joi.object({
        // The Omeda BehaviorAttribute ID for the `Parameter1 Action Source` attribute.
        id: Joi.number().required(),
        valueIds: Joi.object({
          default: Joi.number().required(),
          newsletterSignup: Joi.number().required(),
          comments: Joi.number().required(),
          contentGate: Joi.number().required(),
        }).required(),
      }).required(),
      newsletterSignupType: Joi.object({
        // The Omeda BehaviorAttribute ID for the `Parameter1 Newsletter Signup Type` attribute.
        id: Joi.number().required(),
        valueIds: Joi.object({
          default: Joi.number().required(),
          pushdown: Joi.number().required(),
          inlineContent: Joi.number().required(),
          inlineSection: Joi.number().required(),
          footer: Joi.number().required(),
        }).required(),
      }).required(),
      contentGateType: Joi.object({
        // The Omeda BehaviorAttribute ID for the `Parameter1 Content Gate Type` attribute.
        id: Joi.number().required(),
        valueIds: Joi.object({
          default: Joi.number().required(),
          metered: Joi.number().required(),
          printPreview: Joi.number().required(),
        }).required(),
      }).required(),
    }).required(),
    brandKey: props.brandKey.required(),
    clientKey: props.clientKey.required(),
    createFromIdentity: Joi.boolean().default(true),
    idxConfig: props.idxConfig.required(),
    idxOmedaRapidIdentifyProp: Joi.string().default('$idxOmedaRapidIdentify'),
    idxRouteTemplates: Joi.object().required(),
    inputId: Joi.string().required(),
    omedaGraphQLClientProp: Joi.string().default('$omedaGraphQLClient'),
    omedaPromoCodeCookieName: Joi.string().default('omeda_promo_code'),
    omedaPromoCodeDefault: Joi.string(),
    omedaRapidIdentifyProp: Joi.string().default('$omedaRapidIdentify'),
    onLoginLinkSentFormatter: Joi.function(),
    onAuthenticationSuccessFormatter: Joi.function(),
    onUserProfileUpdateFormatter: Joi.function(),
    rapidIdentProductId: Joi.number().required(),
  }), params);

  // strip `oly_enc_id` when identity-x user is logged-in
  app.use(stripOlyticsParam());

  // set `omeda_promo_code` when the URL parameter is present
  app.use(setPromoSourceCookie({
    omedaPromoCodeCookieName,
  }));

  // install omeda middleware
  omeda(app, {
    brandKey,
    clientKey,
    appId,
    inputId,
    rapidIdentProductId,
    omedaGraphQLClientProp,
    omedaRapidIdentifyProp,
  });

  // add appropiate identity-x to omeda integration hooks
  addOmedaHooksToIdentityXConfig({
    appendBehaviorToHook,
    appendDemographicToHook,
    appendPromoCodeToHook,
    behaviors,
    behaviorAttributes,
    brandKey,
    idxConfig,
    idxOmedaRapidIdentifyProp,
    omedaGraphQLClientProp,
    omedaPromoCodeCookieName,
    omedaPromoCodeDefault,
    shouldAwait,
    onLoginLinkSentFormatter,
    onAuthenticationSuccessFormatter,
    onUserProfileUpdateFormatter,
  });

  // attach the identity-x rapid identification wrapper middleware
  app.use(rapidIdentify({
    brandKey,
    productId: rapidIdentProductId,
    prop: idxOmedaRapidIdentifyProp,
    omedaRapidIdentifyProp,
    omedaPromoCodeCookieName,
    omedaPromoCodeDefault,
  }));

  // install identity x
  identityX(app, idxConfig, { templates: idxRouteTemplates });

  app.use(setOlyticsCookie({ brandKey }));
  app.use(setIdentityCookie({ brandKey, createFromIdentity }));

  // install the Omeda data sync middleware
  app.use(resyncCustomerData({
    brandKey,
    omedaGraphQLClientProp,
  }));

  // register the rapid identify AJAX route
  app.use('/__idx/omeda-rapid-ident', rapidIdentifyRouter({
    brandKey,
    idxOmedaRapidIdentifyProp,
    omedaPromoCodeCookieName,
    omedaPromoCodeDefault,
  }));
};
