const { createBaseDB, createMongoClient } = require('@parameter1/base-cms-db');
const { LEONIS_DSN } = require('../env');

const client = createMongoClient(LEONIS_DSN);

module.exports = (tenant) => createBaseDB({ tenant, client });
