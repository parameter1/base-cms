const Joi = require('@parameter1/joi');
const { validate } = require('@parameter1/joi/utils');
const auth0 = require('@parameter1/base-cms-marko-web-auth0');
const identityX = require('@parameter1/base-cms-marko-web-identity-x');
const IdXConfig = require('@parameter1/base-cms-marko-web-identity-x/config');
const middleware = require('./middleware');
const afterCallback = require('./after-callback');

module.exports = (app, params = {}) => {
  const {
    // Auth0 Configs
    baseURL,
    clientID,
    issuerBaseURL,
    clientSecret,
    // IdentityX Config
    idxConfig,
    idxRouteTemplates,
  } = validate(Joi.object({
    baseURL: Joi.string().required().description('The application\'s currently available URL.'),
    clientID: Joi.string().required().description('The application\'s Auth0 ClientID'),
    clientSecret: Joi.string().required().description('The application\'s Auth0 Client Secert'),
    issuerBaseURL: Joi.string().required().description('The Auth0 tenant URL'),
    idxConfig: Joi.object().required().instance(IdXConfig),
    idxRouteTemplates: Joi.object().required(),
  }), params);

  // install identity x
  identityX(app, idxConfig, { templates: idxRouteTemplates });

  // install auth0 middleware
  auth0(app, {
    baseURL,
    clientID,
    issuerBaseURL,
    secret: clientSecret,
    afterCallback,
  });

  // Load A0+IdX middleware
  app.use(middleware);
};
