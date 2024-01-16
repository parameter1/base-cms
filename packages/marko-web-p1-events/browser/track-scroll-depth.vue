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
    targetScrollDepths: {
      type: Array,
      default: () => ([0.25, 0.50, 0.75, 0.9]),
    },
    action: {
      type: String,
      default: 'Scroll',
    },
    category: {
      type: String,
      default: 'Content',
    },
  },

  data() {
    return {
      didScroll: {
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
    this.targetScrollDepths.forEach((d) => {
      this.didScroll[d] = false;
    });
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
      Object.keys(this.didScroll).forEach((d) => {
        if (!this.didScroll[d] && currentPercentage >= d) {
          this.didScroll[d] = true;

          const lab = `${Number(d) * 100} percent`;
          if (window.p1events) {
            window.p1events('track', {
              category: this.category,
              action: this.action,
              lab,
              entity: this.entity,
              props: {
                didScroll: this.didScroll,
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
