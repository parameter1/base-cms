const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { json } = require('body-parser');
const { asyncRoute } = require('@parameter1/base-cms-utils');
const embedly = require('./embedly');

const app = express();
const dev = process.env.NODE_ENV === 'development';

const CORS = cors({
  methods: ['GET', 'POST'],
  maxAge: 600,
});

app.use(helmet());
app.use(json());
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);

app.use(CORS);
app.options('*', CORS);

app.post('/', asyncRoute(async (req, res) => {
  const { body } = req;
  const data = await embedly.oembed(body.url, body.params);
  res.json(data);
}));

app.get('/', asyncRoute(async (req, res) => {
  const { query } = req;
  const data = await embedly.oembed(query.url, query);
  res.json(data);
}));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const { message, stack } = err;
  const status = err.statusCode || err.status || 500;
  const obj = { error: true, status, message };
  if (dev && stack) obj.stack = stack.split('\n');
  res.status(status).json(obj);
});

module.exports = app;
