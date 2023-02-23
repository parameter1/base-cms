const { get } = require('@parameter1/base-cms-object-path');
const AbstractConfig = require('./abstract-config');
const distLoader = require('./dist-loader');

class CoreConfig extends AbstractConfig {
  /**
   *
   * @param {object} config
   */
  constructor(config) {
    super(config);
    const distDir = this.get('distDir');
    this.assetLoader = {
      js: distLoader({ distDir, type: 'js', entry: 'browser/index.js' }),
      css: distLoader({ distDir, type: 'css', entry: 'server/styles/index.scss' }),
    };
  }

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

  sources() {
    const js = this.assetLoader.js();
    return [js];
  }

  styles() {
    const css = this.assetLoader.css();
    return [css];
  }
}

module.exports = CoreConfig;
