const { createBaseDB, createMongoClient } = require('@parameter1/base-cms-db');
const { TAURON_DSN } = require('../env');

const client = createMongoClient(TAURON_DSN);

module.exports = (tenant) => createBaseDB({ tenant, client });
