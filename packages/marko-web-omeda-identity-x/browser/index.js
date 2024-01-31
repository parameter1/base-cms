import IdentityX from '@parameter1/base-cms-marko-web-identity-x/browser';

const RapidIdentify = () => import(/* webpackChunkName: "omeda-identity-x-rapid-identify" */ './rapid-identify.vue');

export default (Browser, idxArgs = {}) => {
  IdentityX(Browser, idxArgs);

  const { EventBus } = Browser;
  EventBus.$on('identity-x-authenticated', (args = {}) => {
    const { user = {} } = args;
    const externalIds = user.externalIds || [];
    const eid = externalIds.find((external) => {
      if (!external || !external.namespace || !external.identifier) return false;
      const { namespace, identifier } = external;
      return namespace.provider === 'omeda'
        && namespace.tenant
        && namespace.type === 'customer'
        && identifier.type === 'encrypted'
        && identifier.value;
    });

    const encryptedId = eid ? eid.identifier.value : null;
    const brandKey = eid ? eid.namespace.tenant : null;
    EventBus.$emit('omeda-identity-x-authenticated', {
      ...args,
      user,
      eid,
      brandKey,
      encryptedId,
    });
  });

  Browser.register('OmedaIdentityXRapidIdentify', RapidIdentify, {
    on: {
      'encrypted-id-found': (...args) => {
        EventBus.$emit('omeda-identity-x-rapid-identify-encrypted-id-found', ...args);
      },
      response: (...args) => {
        EventBus.$emit('omeda-identity-x-rapid-identify-response', ...args);
      },
    },
  });
};
