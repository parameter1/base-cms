const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { json } = require('body-parser');
const { asyncRoute } = require('@parameter1/base-cms-utils');
const embedly = require('./embedly');
const cache = require('./cache');

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

const retrieveOembed = async ({ url, params }) => {
  const data = await embedly.oembed(url, params);
  // If it returns as link return it as a video instead
  if (data.type === 'link') {
    return { ...data, url, };
  }
  return data;
};

app.post('/', asyncRoute(async (req, res) => {
  const { url, ...params } = req.body;
  const data = await retrieveOembed({ url, params });
  // post will set to cache, but not read from it
  await cache.setFor({ url, params, data });
  res.json(data);
}));

app.get('/', asyncRoute(async (req, res) => {
  const { url, ...params } = req.query;
  const cacheControl = req.headers['cache-control'];
  const noCache = cacheControl && /no-cache/i.test(cacheControl);

  // allow for fresh data retrieval
  const cached = noCache ? null : await cache.getFor({ url, params });
  res.set('X-Cache', cached ? 'hit' : 'miss');
  if (cached) {
    res.set('Age', cached.age);
    return res.json(cached.data);
  }
  const data = await retrieveOembed({ url, params });
  await cache.setFor({ url, params, data });
  return res.json(data);
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
