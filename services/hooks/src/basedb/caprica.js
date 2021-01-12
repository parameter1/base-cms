const { createBaseDB, createMongoClient } = require('@parameter1/base-cms-db');
const { CAPRICA_DSN } = require('../env');

const client = createMongoClient(CAPRICA_DSN);

module.exports = tenant => createBaseDB({ tenant, client });
