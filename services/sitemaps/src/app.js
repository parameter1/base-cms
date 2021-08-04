const express = require('express');
const helmet = require('helmet');
const { apollo, websiteContext } = require('./middleware');
const routes = require('./routes');

const app = express();

app.use(helmet());
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);

app.use(apollo());
app.use(websiteContext());

routes(app);

module.exports = app;
