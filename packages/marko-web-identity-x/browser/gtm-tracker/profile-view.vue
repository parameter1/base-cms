<template>
  <div id="profile-view" />
</template>

<script>
import { profileView } from '../../utils/gtm-events';

export default {
  /**
   *
   */
  props: {
    eventName: {
      type: String,
      default: 'profile_view',
    },
  },
  created() {
    this.observer = new IntersectionObserver((event) => {
      if (event[0].isIntersecting) {
        profileView({ event: this.eventName });
      }
    });
  },
  mounted() {
    this.observer.observe(this.$el);
  },
};
</script>
