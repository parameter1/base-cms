<template>
  <div class="marko-web-p1-events-inquiry-listener" style="display: none;" />
</template>

<script>
export default {
  inject: ['EventBus'],

  props: {
    entity: {
      type: String,
      required: true,
    },
    eventName: {
      type: String,
      default: 'inquiry-form-submit',
    },
  },

  created() {
    if (!window.p1events) return;

    this.EventBus.$on(this.eventName, ({ payload } = {}) => {
      const props = { ...payload };
      delete props.token;
      window.p1events('track', {
        category: 'Inquiry',
        action: 'Submit',
        entity: this.entity,
        props,
      });
    });
  },
};
</script>
