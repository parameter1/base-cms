<template>
  <div id="content-meter-gtm-event" />
</template>

<script>

const { log } = console;

export default {
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
          const payload = {
            event: 'identity-x-content-meter-view',
            'identity-x': {
              label: 'content-meter',
              views,
              remaining,
              overlayDisplayed,
            },
          };
          dataLayer.push(payload);
          const { searchParams } = new URL(window.location.href);
          if (searchParams.has('idxDebugger')) {
            log('identity-x event: identity-x-content-meter-view', payload);
          }
        }
      }
    });
  },
  mounted() {
    this.observer.observe(this.$el);
  },
};
</script>
