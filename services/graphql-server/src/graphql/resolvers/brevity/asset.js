const { createSrcFor } = require('@parameter1/base-cms-image');
const defaults = require('../../defaults');

module.exports = {
  /**
   *
   */
  BrevityAssetImage: {
    src: (image, { input = {} }, { site }) => {
      // Use site image host otherwise fallback to global default.
      const imageHost = site.get('imageHost', defaults.imageHost);
      return createSrcFor(imageHost, image, input.options);
    },
  },
};
