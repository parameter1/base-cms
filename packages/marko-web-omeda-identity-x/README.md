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
|`omedaRapidIdentifyProp` | No | The property (in the express app context) where the Omeda rapid identification service is located. | `$omedaRapidIdentify` |

### Applying Omeda data to events
To send a custom behavior, demographic, or promocode along with a rapid identification request, use the relevant `setHookBehavior`, `setHookDemographic`, or `setHookPromoCode` functions of the config instance.

#### Custom Behavior (`setHookBehavior`)
This function ensures that the supplied behavior id is included as part of the rapid identification request. The behavior must be created before use via the Omeda Behavior APIs.

| Argument | Type | Description |
| - | - | - |
| `hookName` | `String` | The IdentityX hook to modify (see [IdX hooks](./add-integration-hooks.js))
| `behaviorId` | `Number` | The Omeda Behavior ID to send

Example:
```js
const oidx = new OIdXConfig({ omedaConfig, idxConfig });
oidx.setHookBehavior('onLoginLinkSent', 6);
```

#### Custom Demographic (`setHookDemographic`)
This function ensures the supplied demographic values are included as part of the rapid identification request. If specified, a `writeInValue` can be sent for a demographic answers supporting OEC/Other values.

| Argument | Type | Description |
| - | - | - |
| `hookName` | `String` | The IdentityX hook to modify (see [IdX hooks](./add-integration-hooks.js))
| `demographicId` | `Number` | The Omeda Demographic ID to send
| `valueIds` | `[Number]` | The Omeda Demographic Value IDs to send
| `writeInValue` | `String` | (optional) The OEC/Other value to send

Example:
```js
const oidx = new OIdXConfig({ omedaConfig, idxConfig });
oidx.setHookDemographic('onAuthenticationSuccess', 1234, [2345, 3456, 4567], 'My custom other/oec value');
```

#### Custom Promo Code (`setHookPromoCode`)
This function ensures the supplied promo code is included as part of the rapid identification request.

*Note*: unlike the other two methods, specifying a hook promo code will __overwrite__ any incoming promo code. Since Omeda promo codes overwrite each other, this allows you to specify the promo code that will __always__ be applied on a hook operation, rather than just appending to the request.

| Argument | Type | Description |
| - | - | - |
| `hookName` | `String` | The IdentityX hook to modify (see [IdX hooks](./add-integration-hooks.js))
| `promoCode` | `String` | The Omeda Promo Code to send

Example:
```js
const oidx = new OIdXConfig({ omedaConfig, idxConfig });
oidx.setHookPromoCode('onUserProfileUpdate', 'FOO_BAR');
```

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
