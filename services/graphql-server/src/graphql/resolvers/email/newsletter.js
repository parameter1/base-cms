const { Base4RestPayload } = require('@parameter1/base-cms-base4-rest-api');
const { get } = require('@parameter1/base-cms-object-path');

const validateRest = require('../../utils/validate-rest');

module.exports = {
  /**
   *
   */
  Mutation: {
    updateEmailNewsletterProvider: async (_, { input }, { base4rest, basedb }) => {
      validateRest(base4rest);
      const type = 'email/product/newsletter';
      const {
        id,
        type: providerType,
        providerId,
        attributes,
      } = input;

      const existingNewsletterProduct = await basedb.findOne('platform.Product', { _id: id }, { projection: { provider: 1 } });
      const existingAttributes = get(existingNewsletterProduct, 'provider.attributes');
      const mergedAttributes = {};
      Object.keys(existingAttributes).forEach((attribute) => {
        if (typeof attributes[attribute] !== 'undefined') {
          mergedAttributes[attribute] = attributes[attribute];
        } else {
          mergedAttributes[attribute] = existingAttributes[attribute];
        }
      });
      Object.keys(attributes).forEach((attribute) => {
        if (!mergedAttributes[attribute] && typeof attributes[attribute] !== 'undefined') {
          mergedAttributes[attribute] = attributes[attribute];
        }
      });
      console.log(mergedAttributes);

      const body = new Base4RestPayload({ type });
      if (providerType) body.set('provider.type', providerType);
      if (providerId) body.set('provider.providerId', providerId);
      if (Object.keys(mergedAttributes)) body.set('provider.attributes', mergedAttributes);
      body.set('id', id);
      await base4rest.updateOne({ model: type, id, body });
      return basedb.findOne('platform.Product', { _id: id });
    },
  },
};
