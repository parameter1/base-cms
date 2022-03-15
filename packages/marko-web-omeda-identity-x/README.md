# BaseCMS Marko Omeda+IdentityX Integrations
Omeda+IdentityX components for BaseCMS/Marko websites.

Based on the identity provider(s) in use, install and configure ***only one*** of these packages. *The other packages can be installed separately if needed, but this package should be the only one configured.*

1. [omeda-identity-x](../marko-web-omeda-identity-x): For sites with both Omeda and IdentityX.
2. [omeda](../marko-web-omeda): For sites with Omeda, but **without** IdentityX.
3. [identity-x](../marko-web-identity-x): For sites with IdentityX, but **without** Omeda.

Additional information can be found in the [Omeda](https://training.omeda.com/knowledge-base/api-overview/) and [IdentityX](https://docs.parameter1.com/identity-x) API documentation.

## Configuration
All configuration data must be passed to the middleware when loaded (See [Middleware Setup](#1-middleware-setup) below.)

| Key | Description | Link
| - | - | - |
| `brandKey` | (Required) The Omeda Brand key (such as `orgcd`).
| `clientKey` | (Optional) The Omeda client key (such as `client_orgc`.) *Required if sending deployment optIns via the underlying omeda package!* | [marko-web-omeda docs](../marko-web-omeda)
| `appId` | (Required) The Omeda application API read token
| `inputId` | (Required) The Omeda application API write token
| `rapidIdentProductId` | (Required) The Omeda identifier for a Website product (ProductType=7).
| `idxConfig` | (Required) An instance of the IdentityX configuration class | [marko-web-identity-x#1](../marko-web-identity-x/config.js)
| `idxRouteTemplates` | (Required) An object containing the Marko templates to use for each IdentityX endpoint. | [marko-web-identity-x#2](../marko-web-identity-x/index.js)
| `omedaGraphQLClientProp` | (Optional) Custom path to the Omeda GraphQL client (within app.locals), default value `$omedaGraphQLClient`
| `omedaRapidIdentifyProp` | (Optional) Custom path to the Omeda Rapid Identification handler (within app.locals), default value `$omedaRapidIdentify`
| `idxOmedaRapidIdentifyProp` | (Optional) Custom path to the IdentityX Omeda Rapid Identification handler (within app.locals), default value `$idXOmedaRapidIdentify`
| `omedaPromoCodeCookieName` | (Optional) The Omeda promocode cookie name to detect, default value `omeda_promo_code`
| `omedaPromoCodeDefault` | (Optional) The default promo code to send with rapid identification requests

## Usage
This package:
1. Configures the underlying [omeda](../marko-web-omeda) and [identity-x](../marko-web-identity-x) packages
2. Hooks into the IdentityX library to push Omeda data to IdX and push IdX data to Omeda when profile updates happen
3. Makes the rapid identification endpoint (`/__idx/omeda-rapid-ident`) available on a base-cms website
4. (Optional) Provides a Vue component to call the rapid identification endpoint

### 1. Middleware Setup
To make the local omeda mountpoint available, load the middleware exported by this package. For most applications, this will be done in the `startServer` function passed to the marko-web package.

See config section above and the Omeda and IdentityX package documentation for available configurations.

```js
const handler = require('@parameter1/base-cms-marko-web-omeda-identity-x');
const omedaConfig = require('./config/omeda');
const idXConfig = require('./config/identity-x');
const idxRouteTemplates = require('./templates/user');

startServer({
  onStart: async (app) => {
    handler(app, {
      ...omedaConfig,
      idxConfig,
      idxRouteTemplates,
    })
  },
}
```

It can also be loaded as a standard Express route middleware.
```js
module.exports = (app) => {
  handler(app, { ...omedaConfig, idxConfig, idxRouteTemplates });
};
```

### 2. Rapid Identification

To use the Rapid Identification hook, load the Vue component in your Browser config. When enabled, the Omeda Rapid Identification API will be called automatically when the `oly_enc_id` URL query parameter is present.
```js
import OmedaIdentityX from '@parameter1/base-cms-marko-web-omeda-identity-x/browser';

export default (Browser) => {
  OmedaIdentityX(Browser);
};
```
