const EJSON = require('mongodb-extended-json');
const BaseDB = require('./basedb');
const MongoDB = require('./mongodb');
const createMongoClient = require('./create-mongo-client');
const createBaseDB = require('./create-basedb');

module.exports = {
  EJSON,
  BaseDB,
  MongoDB,
  createMongoClient,
  createBaseDB,
};
