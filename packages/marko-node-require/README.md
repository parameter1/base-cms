# MarkoJS Node Require
Overrides the default `marko/node-require` logic to only compile `.marko` files that are new or out-of-date (as opposed to compiling everything).

Load as the first module in your app's entrypoint via
```js
require('@parameter1/base-cms-marko-node-require');
```
