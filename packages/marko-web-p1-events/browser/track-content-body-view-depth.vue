<template>
  <div class="marko-web-p1-events-content-body-scroll-depth" style="display: none;" />
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
      default: '.page-contents__content-body',
    },
    fullViewDepth: {
      type: Number,
      default: 0.90,
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
        0.0: false,
      },
      cb: null,
    };
  },
  destroyed() {
    window.removeEventListener('scroll', this.handleScroll);
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll);
    // add % based depths
    this.targetViewDepths.forEach((d) => {
      this.depthsViewed[d] = false;
    });
    // add full page read depth marker
    this.depthsViewed[this.fullViewDepth] = false;
    // wait until next tick to attempt to load body selector post document.ready.
    this.$nextTick(() => {
      if (!this.cb) this.cb = document.querySelector(this.selector);
    });
  },
  methods: {
    handleScroll() {
      if (!this.cb) return;
      const { scrollY } = window;
      const { height } = this.cb.getBoundingClientRect();
      Object.keys(this.depthsViewed).forEach((d) => {
        if (
          !this.depthsViewed[d]
          && Math.floor(scrollY) >= ((Math.floor(height * d)))
        ) {
          this.depthsViewed[d] = true;

          const action = (Number(d) === Number(this.fullViewDepth)) ? `100% ${this.action}` : `${d * 100}% ${this.action}`
          if (window.p1events) {
            // console.warn the track event for now until we determin corrct action & category
            console.warn('track', {
              category: this.category,
              action,
              entity: this.entity,
              props: {
                depthsViewed: this.depthsViewed,
              },
            });
            // window.p1events('track', {
            //   category: this.category,
            //   action: this.action,
            //   entity: this.entity,
            //   props: {
            //     depthsViewed: this.depthsViewed,
            //   },
            // });
          }
        }
      });
      this.startY = scrollY;
    },
  },
};
</script>
