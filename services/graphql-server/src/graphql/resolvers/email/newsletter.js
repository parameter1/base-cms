const { Base4RestPayload } = require('@parameter1/base-cms-base4-rest-api');
const { getAsObject } = require('@parameter1/base-cms-object-path');

const validateRest = require('../../utils/validate-rest');

module.exports = {
  /**
   *
   */
  Mutation: {
    /**
    * @description Update email newsletter provider fields.
    * Setting an key in attributes value to null,
    * will subsequently remove that key on the respective Newsletter Product's attributes,
    */
    updateEmailNewsletterProvider: async (_, { input }, { base4rest, basedb }) => {
      validateRest(base4rest);
      const type = 'email/product/newsletter';
      const { id, type: providerType, providerId } = input;

      const product = await basedb.strictFindById('platform.Product', id, { projection: { provider: 1 } });
      const attributesFromInput = getAsObject(input, 'attributes');
      const existingAttributes = getAsObject(product, 'provider.attributes');
      const mergedAttributes = { ...existingAttributes, ...attributesFromInput };
      Object.entries(attributesFromInput).forEach(([key, value]) => {
        if (value === null) delete mergedAttributes[key];
      });

      const body = new Base4RestPayload({ type });
      if (providerType) body.set('provider.type', providerType);
      if (providerId) body.set('provider.providerId', providerId);
      body.set('provider.attributes', mergedAttributes);
      body.set('id', id);
      await base4rest.updateOne({ model: type, id, body });
      return basedb.findOne('platform.Product', { _id: id });
    },
  },
};
