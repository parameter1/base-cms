<template>
  <div />
</template>

<script>
import { share } from '../utils/gtm-events';

export default {
  inject: ['EventBus'],
  props: {
    eventName: {
      type: String,
      default: 'social-share-open',
    },
  },
  created() {
    this.EventBus.$on(this.eventName, (event) => {
      const provider = event && event.provider && event.provider.name ? event.provider.name : null;
      if (provider) share(provider);
    });
  },
};
</script>
