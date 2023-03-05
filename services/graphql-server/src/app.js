const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { nanoid } = require('nanoid');
const routes = require('./routes');

const app = express();
const CORS = cors({
  methods: ['GET', 'POST'],
  maxAge: 600,
});

app.use(helmet());
app.use(CORS);
app.options('*', CORS);

app.use((req, res, next) => {
  // set unique request id.
  req.id = nanoid();
  next();
});

routes(app);

module.exports = app;
