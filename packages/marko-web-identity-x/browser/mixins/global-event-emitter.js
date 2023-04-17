export default {
  inject: ['EventBus'],
  props: {
    additionalEventData: {
      type: Object,
      default: () => ({}),
    },
  },
  methods: {
    emit(name, data) {
      const source = this.loginSource || this.source;
      const actionSource = window.IdentityX.getLoginSource() || source;
      console.warn('actionSource: ', actionSource, data, this.token);
      const payload = {
        ...data,
        ...this.additionalEventData,
        additionalEventData: this.additionalEventData,
        actionSource,
        loginSource: actionSource,
        source: actionSource,
      };
      const { EventBus } = this;
      this.$emit(name, payload);
      EventBus.$emit(`identity-x-${name}`, payload);
    },
  },
};
