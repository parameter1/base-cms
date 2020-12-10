const { createBaseDB, createMongoClient } = require('@base-cms/db');
const { VIRGON_DSN } = require('../env');

const client = createMongoClient(VIRGON_DSN);

module.exports = tenant => createBaseDB({ tenant, client });
