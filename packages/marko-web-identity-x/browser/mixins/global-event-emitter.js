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
      const payload = { ...data, ...this.additionalEventData };
      const { EventBus } = this;
      this.$emit(name, payload);
      EventBus.$emit(`identity-x-${name}`, payload);
    },
  },
};
