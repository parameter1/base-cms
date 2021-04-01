<template>
  <div id="native-x-end-of-content" />
</template>

<script>
import { endOfContent } from '../utils/gtm-events';

export default {
  created() {
    this.observer = new IntersectionObserver((event) => {
      if (event[0].isIntersecting) {
        endOfContent(window);
      }
    });
  },
  mounted() {
    this.observer.observe(this.$el);
  },
};
</script>
