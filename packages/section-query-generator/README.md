BaseCMS section query generator
===

This utility can be used to regenerate the BaseCMS content `sectionQuery` field.

## Usage
To use import the package and await the exported function, supplying the relevant tenant key and an active (connected) MongoDB client.

```js
const buildFn = require('@parameter1/base-cms-section-query-generator');
const { createMongoClient } = require('@parameter1/base-cms-db');

const { NODE_ENV, MONGO_DSN } = process.env;
const appname = `myapp v1.0 (env: ${NODE_ENV})`;

const client = createMongoClient(MONGO_DSN, { appname });
await client.connect();

await buildFn({ client, tenant: 'my_tenant_key' });

await client.close();
```

## Options

| Option | Description | Default value
| - | - | - |
| `client` | (Required) A connected MongoDB client
| `tenant` | (Required) A BaseCMS tenant key
| `logger` | (Optional) A function to log debug information to | `console.log`
| `maxDate` | (Option) A Date indicating how far in the future to check for schedules | `2038-01-01`
| `createIndexes` | (Optional) A Boolean indicating if indexes should be built | `false`
