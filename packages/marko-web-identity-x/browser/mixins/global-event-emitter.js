export default {
  inject: ['EventBus'],
  props: {
    additionalEventData: {
      type: Object,
      default: () => ({}),
    },
    eventLabel: {
      type: String,
      required: true,
    },
  },
  methods: {
    emit(name, data) {
      const payload = { ...data, ...this.additionalEventData, label: this.eventLabel };
      const { EventBus } = this;
      this.$emit(name, payload);
      EventBus.$emit(`identity-x-${name}`, payload);
    },
  },
};
