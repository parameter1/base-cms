export default (name, that, data = {}, ...rest) => {
  const payload = { ...data, ...that.additionalEventData, label: that.eventLabel };
  const { EventBus } = that;
  that.$emit(name, payload, ...rest);
  EventBus.$emit(`identity-x-${name}`, payload, ...rest);
};
