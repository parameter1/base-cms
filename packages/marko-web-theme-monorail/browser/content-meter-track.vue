<template>
  <div id="content-meter-gtm-event" />
</template>

<script>

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
  },
};
</script>
