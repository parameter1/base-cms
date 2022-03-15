const { Base4RestPayload } = require('@parameter1/base-cms-base4-rest-api');

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

      const body = new Base4RestPayload({ type });
      body.set('provider.type', providerType);
      body.set('provider.providerId', providerId);
      body.set('provider.attributes', attributes);
      body.set('id', id);
      console.log(await base4rest.updateOne({ model: type, id, body }));
      return basedb.findOne('platform.Product', { _id: id });
    },
  },
};
