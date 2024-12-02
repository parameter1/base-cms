<template>
  <div id="content-meter-gtm-event" :class="classes.join(', ')"/>
</template>

<script>

const { log } = console;

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
          const payload = {
            event: 'identity-x-content-meter-view',
            'identity-x': {
              label: 'content-meter',
              views,
              remaining,
              overlayDisplayed,
            },
          };
          this.emitP1Event('View');
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
    this.EventBus.$on('identity-x-login-link-sent', ({ actionSource }) => {
      if (actionSource === 'content_meter_login') {
        this.classes.push('login-link-sent');
        this.emitP1Event('Submit');
      }
    });
  },
  methods: {
    emitP1Event(action) {
      if (!window.p1events) return;
      const { views, remaining, overlayDisplayed } = this;
      const lab = !overlayDisplayed ? null : 'Gated';
      window.p1events('track', {
        category: 'Content Meter',
        action,
        lab,
        props: { n: views },
      });
      this.EventBus.$emit(`identity-x-content-meter-${action}`, { payload: { views, remaining, overlayDisplayed }});
    },
  },
};
</script>
