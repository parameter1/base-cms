# BaseCMS Marko Omeda+IdentityX Integrations
Omeda+IdentityX components for BaseCMS/Marko websites.

Based on the identity provider(s) in use, install and configure ***only one*** of these packages. *The other packages can be installed separately if needed, but this package should be the only one configured.*

1. [omeda-identity-x](../marko-web-omeda-identity-x): For sites with both Omeda and IdentityX.
2. [omeda](../marko-web-omeda): For sites with Omeda, but **without** IdentityX.
3. [identity-x](../marko-web-identity-x): For sites with IdentityX, but **without** Omeda.

Additional information can be found in the [Omeda](https://training.omeda.com/knowledge-base/api-overview/) and [IdentityX](https://docs.parameter1.com/identity-x) API documentation.

## Configuration
All configuration data must be passed to the middleware when loaded (See [Middleware Setup](#1-middleware-setup) below.)

| Property  | Required? | Description | Default value |
| - | - | - | - |
| `brandKey` | **Yes** | The Omeda Brand key (such as `orgcd`).
| `clientKey` | No | The Omeda client key (such as `client_orgc`.) *Required if sending deployment optIns via the underlying omeda package!* [marko-web-omeda docs](../marko-web-omeda)
| `appId` | **Yes** | The Omeda application API read token
| `inputId` | **Yes** | The Omeda application API write token
| `rapidIdentProductId` | **Yes** | The Omeda identifier for a Website product (ProductType=7).
| `idxConfig` | **Yes** | An instance of the IdentityX configuration class (see [marko-web-identity-x#1](../marko-web-identity-x/config.js)) | _n/a_
| `idxRouteTemplates` | **Yes** | An object containing the Marko templates to use for each IdentityX endpoint. (see [marko-web-identity-x#2](../marko-web-identity-x/index.js))
| `omedaPromoCodeCookieName` | No | The name of the cookie to look for a persisted/original promo code. | `omeda_promo_code` |
| `omedaPromoCodeDefault` | No | The default promo code to send with all Omeda requests. Falls back to input ID default configured by Omeda. |
| `idxOmedaRapidIdentifyProp` | No | The property (in the express app context) where the O+IdX rapid identification service is located. | `$idxOmedaRapidIdentify` |
| `omedaGraphQLClientProp` | No | The property (in the express app context) where the Omeda GraphQL client is located. | `$omedaGraphQLClient` |
| `omedaRapidIdentifyProp` | No | The property (in the express app context) where the Omeda rapid identification service is located. | `$omedaRapidIdentify` |
| `appendBehaviorToHook` | No | An array of objects defining behaviors to append to rapid identification calls.
| `appendBehaviorToHook[].hook` | | The name of the hook, such as `onLoginLinkSent`
| `appendBehaviorToHook[].behaviorId` || The Omeda Behavior ID to append to the rapid identification call.
| `appendDemographicToHook` | No | An array of objects defining demographics to append to rapid identification calls.
| `appendDemographicToHook[].hook` | | The name of the hook, such as `onLoginLinkSent`
| `appendDemographicToHook[].demographicId` || The Omeda Demographic ID to append.
| `appendDemographicToHook[].valueIds` || An array of Omeda Demographic Value IDs (`Int`s) to append
| `appendDemographicToHook[].writeInValue` || A string to include as an OEC/Other value
| `appendPromoCodeToHook` | No | An array of objects defining demographics to append to rapid identification calls.
| `appendPromoCodeToHook[].hook` | | The name of the hook, such as `onLoginLinkSent`
| `appendPromoCodeToHook[].promoCode` || The Omeda Promo Code (`String`) to append.

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
