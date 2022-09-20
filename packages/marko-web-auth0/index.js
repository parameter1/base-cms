const { auth } = require('express-openid-connect');
const Joi = require('@parameter1/joi');
const { validate } = require('@parameter1/joi/utils');

module.exports = (app, params = {}) => {
  const config = validate(Joi.object({
    authRequired: Joi.boolean().default(false),
    auth0Logout: Joi.boolean().default(true),
    baseURL: Joi.string().required(),
    clientID: Joi.string().required(),
    issuerBaseURL: Joi.string().required(),
    secret: Joi.string().required(),
    routes: Joi.object().default({ login: false }),
    afterCallback: Joi.function(),
  }), params);

  app.use((req, _, next) => {
    req.auth0Enabled = true;
    next();
  });

  app.use(auth(config));

  // Redirect after login if `returnTo` URL parameter is present.
  if (config.routes.login === false) {
    app.get('/login', (req, res) => {
      const returnTo = req.query.returnTo || config.baseURL;
      res.oidc.login({ returnTo });
    });
  }
};
