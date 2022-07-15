# BaseCMS Marko Omeda+IdentityX Integrations
Omeda+IdentityX components for BaseCMS/Marko websites.

Based on the identity provider(s) in use, install and configure ***only one*** of these packages. *The other packages can be installed separately if needed, but this package should be the only one configured.*

1. [omeda-identity-x](../marko-web-omeda-identity-x): For sites with both Omeda and IdentityX.
2. [omeda](../marko-web-omeda): For sites with Omeda, but **without** IdentityX.
3. [identity-x](../marko-web-identity-x): For sites with IdentityX, but **without** Omeda.

Additional information can be found in the [Omeda](https://training.omeda.com/knowledge-base/api-overview/) and [IdentityX](https://docs.parameter1.com/identity-x) API documentation.

## Configuration
To configure this integration, create a new instance of the `OmedaIdentityXConfiguration` class and pass it to the middleware when loaded (See [Middleware Setup](#1-middleware-setup) below.)
The `OmedaIdentityXConfiguration` class accepts the following parameters:

| Property  | Required? | Description | Default value |
| - | - | - | - |
| `omedaConfig` | **Yes** | The Omeda configuration (POJO) | _n/a_
| `idxConfig` | **Yes** | An instance of the `IdentityXConfiguration` class | _n/a_
`omedaPromoCodeCookieName` | No | The name of the cookie to look for a persisted/original promo code. | `omeda_promo_code` |
| `omedaPromoCodeDefault` | No | The default promo code to send with all Omeda requests. | None: falls back to input ID default configured by Omeda. |
| `idxOmedaRapidIdentifyProp` | No | The property (in the express app context) where the O+IdX rapid identification service is located. | `$idxOmedaRapidIdentify` |
| `omedaGraphQLClientProp` | No | The property (in the express app context) where the Omeda GraphQL client is located. | `$omedaGraphQLClient` |
|`omedaRapidIdentifyProp` | No | The property (in the express app context) where the Omeda rapid identification service is located. | `$omedaRapidIdentify` |

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
const config = require('@parameter1/base-cms-marko-web-omeda-identity-x/config');
const omedaConfig = require('./config/omeda');
const idXConfig = require('./config/identity-x');
const idxRouteTemplates = require('./templates/user');

const oidxConfig = new config({ omedaConfig, idxConfig });

startServer({
  onStart: async (app) => {
    handler(app, oidxConfig, idxRouteTemplates);
  },
}
```

It can also be loaded as a standard Express route middleware.
```js
module.exports = (app) => {
  handler(app, oidxConfig, idxRouteTemplates);
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
