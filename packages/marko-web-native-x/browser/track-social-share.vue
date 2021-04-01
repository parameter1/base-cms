<template>
  <div />
</template>

<script>
import { get } from '@parameter1/base-cms-object-path';
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
      const provider = get(event, 'provider.name');
      share(window, provider);
    });
  },
};
</script>
