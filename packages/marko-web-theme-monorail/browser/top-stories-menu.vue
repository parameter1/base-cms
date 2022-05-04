<template>
  <div>
    <div v-if="isLoading">
      Loading top stories...
    </div>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-else-if="html" v-html="html" />
    <div v-if="error">
      {{ error.message }}
    </div>
  </div>
</template>

<script>
import EventBus from '@parameter1/base-cms-marko-web/browser/event-bus';

export default {
  props: {
    sectionAlias: {
      type: String,
      default: 'home',
    },
  },

  data: () => ({
    error: null,
    hasLoaded: false,
    html: null,
    isLoading: false,
  }),

  created() {
    EventBus.$on('site-menu-expanded', (expanded) => {
      if (expanded) this.load();
    });
  },

  methods: {
    async load() {
      if (!this.isLoading && !this.hasLoaded) {
        try {
          this.error = null;
          this.isLoading = true;
          const input = JSON.stringify({ sectionAlias: this.sectionAlias });
          const href = `/__render-block/top-stories-menu?input=${encodeURIComponent(input)}`;
          const res = await fetch(href, { credentials: 'same-origin' });
          this.html = await res.text();
          this.hasLoaded = true;
        } catch (e) {
          this.error = e;
        } finally {
          this.isLoading = false;
        }
      }
    },
  },
};
</script>
