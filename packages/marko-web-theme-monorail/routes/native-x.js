const withNativeXStory = require('@parameter1/base-cms-marko-web-native-x/middleware/with-story');
const { getAsObject } = require('@parameter1/base-cms-object-path');
const queryFragment = require('../graphql/fragments/native-x-story');
const template = require('../templates/content/native-x-story');

module.exports = (app) => {
  const config = getAsObject(app, 'locals.nativeX');
  app.get('/sponsored/:section/:slug/:id', withNativeXStory({ config, template, queryFragment }));
};
