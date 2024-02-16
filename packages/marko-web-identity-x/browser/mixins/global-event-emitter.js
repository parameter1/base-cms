export default {
  inject: ['EventBus'],
  props: {
    additionalEventData: {
      type: Object,
      default: () => ({}),
    },
  },
  methods: {
    emit(name, data, entity) {
      const source = this.loginSource || this.source;
      const dataActionSource = data ? data.actionSource : undefined;
      const actionSource = dataActionSource || window.IdentityX.getLoginSource() || source;
      const payload = {
        ...data,
        ...this.additionalEventData,
        additionalEventData: this.additionalEventData,
        actionSource,
        loginSource: actionSource,
        source: actionSource,
        entity,
      };
      const { EventBus } = this;
      this.$emit(name, payload);
      EventBus.$emit(`identity-x-${name}`, payload);
    },
  },
};
