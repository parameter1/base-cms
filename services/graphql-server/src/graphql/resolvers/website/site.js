const { Base4RestPayload } = require('@parameter1/base-cms-base4-rest-api');

const validateRest = require('../../utils/validate-rest');
const defaults = require('../../defaults');

module.exports = {
  /**
   *
   */
  WebsiteSite: {
    origin: ({ host }) => `https://${host}`,
    imageHost: ({ imageHost }) => imageHost || defaults.imageHost,
    assetHost: ({ assetHost }) => assetHost || defaults.assetHost,
    language: ({ language }) => ({ ...defaults.language, ...language }),
    date: ({ date }) => ({ ...defaults.date, ...date }),
    title: ({ name, shortName }) => {
      if (shortName) return `${name} (${shortName})`;
      return name;
    },
  },

  /**
   *
   */
  WebsiteSiteLanguage: {
    code: (language) => {
      const { primaryCode, subCode } = language;
      const primary = primaryCode.toLowerCase();
      if (!subCode) return primary;
      return `${primary}-${subCode.toLowerCase()}`;
    },

    primaryCode: language => language.primaryCode.toLowerCase(),

    subCode: (language) => {
      if (!language.subCode) return null;
      return language.subCode.toLowerCase();
    },
  },

  /**
   *
   */
  Query: {
    /**
     *
     */
    websiteContext: (_, args, { site }) => {
      if (site.exists()) return site.obj();
      return null;
    },
  },
  /**
   *
   */
  Mutation: {
    /**
     *
     */
    updateWebsiteSiteHost: async (_, { input }, { base4rest, basedb }) => {
      validateRest(base4rest);
      const type = 'website/product/site';
      const { id, host } = input;

      const body = new Base4RestPayload({ type });
      body.set('host', host);
      body.set('id', id);
      await base4rest.updateOne({ model: type, id, body });
      return basedb.findOne('platform.Product', { _id: id });
    },
    /**
     *
     */
    updateWebsiteSiteURL: async (_, { input }, { base4rest, basedb }) => {
      validateRest(base4rest);
      const type = 'website/product/site';
      const { id, url } = input;

      const body = new Base4RestPayload({ type });
      body.set('url', url);
      body.set('id', id);
      await base4rest.updateOne({ model: type, id, body });
      return basedb.findOne('platform.Product', { _id: id });
    },
    /**
     *
     */
    updateWebsiteSiteImageHost: async (_, { input }, { base4rest, basedb }) => {
      validateRest(base4rest);
      const type = 'website/product/site';
      const { id, imageHost } = input;

      const body = new Base4RestPayload({ type });
      body.set('imageHost', imageHost);
      body.set('id', id);
      await base4rest.updateOne({ model: type, id, body });
      return basedb.findOne('platform.Product', { _id: id });
    },
    /**
     *
     */
    updateWebsiteSiteAssetHost: async (_, { input }, { base4rest, basedb }) => {
      validateRest(base4rest);
      const type = 'website/product/site';
      const { id, assetHost } = input;

      const body = new Base4RestPayload({ type });
      body.set('assetHost', assetHost);
      body.set('id', id);
      await base4rest.updateOne({ model: type, id, body });
      return basedb.findOne('platform.Product', { _id: id });
    },

  },
};
