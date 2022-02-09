BaseCMS section query generator
===

This utility can be used to regenerate the BaseCMS content `sectionQuery` field.

## Usage
To use, import the package and await the exported function, supplying the relevant tenant key and an active (connected) MongoDB client.

*Note*: You **must** use the [`@parameter1/base-cms-db`](https://github.com/parameter1/base-cms/tree/master/packages/db) MongoDB client/factory.

```js
const buildFn = require('@parameter1/base-cms-section-query-generator');
const { createMongoClient } = require('@parameter1/base-cms-db');

const { NODE_ENV, MONGO_DSN } = process.env;
const appname = `myapp v1.0 (env: ${NODE_ENV})`;

const client = createMongoClient(MONGO_DSN, { appname });
await client.connect();

await buildFn({ tenant: 'my_tenant_key', client });

await client.close();
```

## Arguments

| Option | Description | Default value
| - | - | - |
| `tenant` | (Required) A BaseCMS tenant key
| `client` | (Required) A connected MongoDB client
| `context` | (Optional) Additional context for the BaseDB instance | `{}`
| `logger` | (Optional) A function to log debug information to | `console.log`
| `maxDate` | (Option) A Date indicating how far in the future to check for schedules | `2038-01-01`
| `createIndexes` | (Optional) A Boolean indicating if indexes should be built | `false`
