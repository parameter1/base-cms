<template>
  <div class="marko-web-p1-events-identity-x-listener" style="display: none;" />
</template>

<script>
export default {
  inject: ['EventBus'],

  props: {
    eventNames: {
      type: Array,
      default: () => [
        'identity-x-login-link-sent',
        'identity-x-authentication-success',
        'identity-x-profile-updated',
      ]
    }
  },

  created() {
    if (!window.p1events) return;
    this.eventNames.forEach((eventName) => {
      this.EventBus.$on(eventName, ({ data, email, source } = {}) => {
        const props = { data, email, source };
        window.p1events('track', {
          category: 'IdentityXAction',
          action: eventName,
          props,
        });
      });
    })

  },
};
</script>
