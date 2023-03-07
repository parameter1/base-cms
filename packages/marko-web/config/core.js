const { get } = require('@parameter1/base-cms-object-path');
const AbstractConfig = require('./abstract-config');

class CoreConfig extends AbstractConfig {
  setWebsiteContext(context) {
    this.websiteContext = context;
  }

  website(path, def) {
    return get(this.websiteContext, path, def);
  }

  /**
   * @deprecated Use this.website('language.code') instead
   */
  locale() {
    return this.website('language.code', 'en-us');
  }

  lazyloadImages() {
    return this.get('images.lazyload', true);
  }

  fallbackImage() {
    return this.get('images.fallback');
  }

  loadMoreMountPoint() {
    return this.get('loadMore.mountPoint', '/__load-more');
  }

  oembedMountPoint() {
    return this.get('oembed.mountPoint', '/__oembed');
  }

  rssMountPoint() {
    return this.get('rss.mountPoint', '/__rss');
  }

  /**
   * @deprecated Use this.website('name') instead
   */
  siteName() {
    return this.website('name', '');
  }
}

module.exports = CoreConfig;
