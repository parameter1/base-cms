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
          this.trackP1Event('view');
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
        this.trackP1Event('login-login-link-sent');
      }
    });
  },
  methods: {
    trackP1Event(action) {
      console.warn('action: ', action, window.p1events);
      // triggercall here
      window.p1events('track', {
        category: 'Identity',
        action,
        label: 'content-meter',
        // ctx,
        // entity,
      });
    },
  },
};
</script>
