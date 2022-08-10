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
      const payload = {
        ...data,
        ...this.additionalEventData,
        // Ensure the `actionSource` is emitted with client-side events
        ...(this.source && { actionSource: this.source }),
        ...(this.loginSource && { actionSource: this.loginSource }),
      };
      const { EventBus } = this;
      this.$emit(name, payload);
      EventBus.$emit(`identity-x-${name}`, payload);
    },
  },
};
