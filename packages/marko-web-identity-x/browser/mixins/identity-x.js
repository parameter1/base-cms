const kebab = s => s.replace(/\B(?:([A-Z])(?=[a-z]))|(?:(?<=[a-z0-9])([A-Z]))/g, '-$1$2').toLowerCase();

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
  mounted() {
    this.emit('displayed', { from: 'mixin' });
  },
  methods: {
    emit(action, data) {
      const { name } = this.$options;
      const payload = { ...data, ...this.additionalEventData, label: this.eventLabel };
      const { EventBus } = this;
      const event = `${kebab(name)}-${action}`;
      this.$emit(event, payload);
      EventBus.$emit(`identity-x-${event}`, payload);
    },
  },
};
