const BrowserComponent = require('../../components/browser-component.marko');
const facebook = require('./facebook-oembed');
const instagram = require('./instagram-oembed');

module.exports = (tag, $global) => {
  const { config } = $global;
  const url = tag.id;
  const facebookPost = facebook(url);
  const instagramPost = instagram(url);
  const props = { mountPoint: config.oembedMountPoint(), url, attrs: tag.attrs };
  if (facebookPost) {
    return facebookPost;
  }
  if (instagramPost) {
    return instagramPost;
  }
  return BrowserComponent.renderToString({ $global, name: 'OEmbed', props });
};
