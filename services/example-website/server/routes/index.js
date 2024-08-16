const gql = require('graphql-tag');
const { get } = require('@parameter1/base-cms-object-path');
const { withContent, withWebsiteSection } = require('@parameter1/base-cms-marko-web/middleware');
const renderBlock = require('@parameter1/base-cms-marko-web-theme-monorail/routes/render-block');
const search = require('@parameter1/base-cms-marko-web-theme-monorail/routes/search');
const print = require('@parameter1/base-cms-marko-web-theme-monorail/routes/print');
const contentMetering = require('@parameter1/base-cms-marko-web-theme-monorail/middleware/content-metering');
const adPreview = require('@parameter1/base-cms-marko-web-theme-monorail/routes/ad-preview');

const nativeX = require('./native-x');
const contentMeteringCfg = require('../../config/content-meter');
const { formatContentResponse } = require('../../middleware/format-content-response');

const index = require('../templates/index');
const content = require('../templates/content');
const section = require('../templates/section');
const leaders = require('../templates/leaders');
const downloads = require('../templates/downloads');

const dynamicPages = require('./dynamic-page');

const queryFragment = require('../../graphql/fragments/content-page');
const sectionFragment = require('../../graphql/fragments/website-section-page');

const loaderQueryFragment = gql`
  fragment WithContentPrimarySectionFragment on Content {
    primarySection {
      id
      alias
    }
    gating {
      surveyType
      surveyId
    }
  }
`;

module.exports = (app, config) => {
  const namespace = get(config, 'mindful.namespace');
  adPreview(app, namespace);
  // NativeX
  nativeX(app);

  // Monorail
  renderBlock(app);

  search(app, config);

  app.get('/', (_, res) => {
    res.marko(index);
  });

  // pages
  dynamicPages(app);

  // Content
  print(app, queryFragment);
  app.get('/*?:id(\\d{8})*', contentMetering(contentMeteringCfg), withContent({
    template: content,
    queryFragment,
    loaderQueryFragment,
    formatResponse: formatContentResponse,
  }));

  // Published content
  app.get('/downloads', (_, res) => {
    res.marko(downloads);
  });

  // Sections
  app.get('/:alias(leaders)', withWebsiteSection({
    template: leaders,
    queryFragment: sectionFragment,
  }));
  app.get('/:alias([a-z0-9-/]+)', withWebsiteSection({
    template: section,
    queryFragment: sectionFragment,
  }));
};
