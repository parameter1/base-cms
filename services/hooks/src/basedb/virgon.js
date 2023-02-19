const { createBaseDB, createMongoClient } = require('@parameter1/base-cms-db');
const { VIRGON_DSN } = require('../env');

const client = createMongoClient(VIRGON_DSN);

module.exports = (tenant) => createBaseDB({ tenant, client });
