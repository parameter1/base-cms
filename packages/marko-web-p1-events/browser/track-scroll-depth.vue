<template>
  <div class="marko-web-p1-events-track-scroll-depth" style="display: none;" />
</template>

<script>

export default {
  props: {
    entity: {
      type: String,
      required: true,
    },
    selector: {
      type: String,
      required: true,
    },
    fullViewDepth: {
      type: Number,
      default: 1,
    },
    targetViewDepths: {
      type: Array,
      default: () => ([0.25, 0.50, 0.75]),
    },
    action: {
      type: String,
      default: 'Viewed',
    },
    category: {
      type: String,
      default: 'Scroll Depth',
    },
  },

  data() {
    return {
      depthsViewed: {
        // set to 1% just to ensure it will only trigger when in view.
        // 0.01: false,
      },
      cb: null,
      start: 0,
      end: 0,
    };
  },
  destroyed() {
    window.removeEventListener('scroll', this.handleScroll);
  },
  mounted() {
    const cb = this.cb || document.querySelector(this.selector);
    if (!cb) return;
    window.addEventListener('scroll', this.handleScroll);
    // add % based depths
    this.targetViewDepths.forEach((d) => {
      this.depthsViewed[d] = false;
    });
    // add full page read depth marker
    this.depthsViewed[this.fullViewDepth] = false;
    if (cb) {
      const { scrollY } = window;
      this.cb = document.querySelector(this.selector);
      const { top, height: h } = this.cb.getBoundingClientRect();
      this.start = 0;
      this.end = Math.floor(scrollY + top + h);
    }
  },
  methods: {
    handleScroll() {
      if (!this.cb) return;
      const { scrollY, innerHeight } = window;
      const { start, end } = this;
      const offset = scrollY + innerHeight;
      if (offset < start) return;
      const total = (end - start);
      const seen = offset - start;
      const currentPercentage = seen / total;
      Object.keys(this.depthsViewed).forEach((d) => {
        if (!this.depthsViewed[d] && currentPercentage >= d) {
          this.depthsViewed[d] = true;

          const action = `${Number(d) * 100} percent`;
          if (window.p1events) {
            window.p1events('track', {
              category: this.category,
              action,
              entity: this.entity,
              props: {
                depthsViewed: this.depthsViewed,
              },
            });
          }
        }
      });
      this.startY = scrollY;
    },
  },
};
</script>
