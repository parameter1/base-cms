<template>
  <div id="content-meter-gtm-event" :class="classes.join(', ')"/>
</template>

<script>

export default {
  inject: ['EventBus'],

  props: {
    views: {
      type: Number,
      default: 0,
    },
    viewLimit: {
      type: Number,
      default: 3,
    },
    displayGate: {
      type: Boolean,
      default: false,
    },
    displayOverlay: {
      type: Boolean,
      required: false,
    },
  },
  data: () => ({
    classes: [],
  }),
  computed: {
    remaining() {
      const { viewLimit, views } = this;
      return viewLimit - views;
    },
    overlayDisplayed() {
      const { displayGate, displayOverlay } = this;
      return displayGate && displayOverlay;
    },
  },
  created() {
    const { views, remaining, overlayDisplayed } = this;
    this.observer = new IntersectionObserver((event) => {
      if (event[0].isIntersecting) {
        const { dataLayer } = window;
        if (dataLayer) {
          dataLayer.push({
            event: 'identity-x-content-meter-view',
            'identity-x': {
              label: 'content-meter',
              views,
              remaining,
              overlayDisplayed,
            },
          });
        }
      }
    });
  },
  mounted() {
    this.observer.observe(this.$el);
    this.EventBus.$on('identity-x-login-link-sent', ({ actionSource }) => {
      if (actionSource === 'content_meter_login') {
        this.classes.push('login-link-sent');
      }
    });
  },
};
</script>
