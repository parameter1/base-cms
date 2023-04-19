import getAsArray from '@parameter1/base-cms-object-path';

export default {
  inject: ['EventBus'],
  methods: {
    emitAutoSignup(data) {
      const { EventBus } = this;
      // See if there are any autoSignups added to the additionalEventData
      // Trigger related autoSignup events for each productId being applied.
      const autoSignups = getAsArray(data, 'additionalEventData.autoSignups');
      if (autoSignups && autoSignups.length) {
        autoSignups.forEach((autoSignup) => {
          EventBus.$emit('identity-x-auto-signup', autoSignup);
        });
      }
    },
  },
};
