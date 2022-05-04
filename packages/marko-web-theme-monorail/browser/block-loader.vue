<template>
  <div :class="classes">
    <div v-if="isLoading">
      Loading {{ label }}...
    </div>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-else-if="html" v-html="html" />
    <div v-if="error">
      <h5>Unable to load {{ label }} block.</h5>
      <p>{{ error.message }}</p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    input: {
      type: Object,
      default: () => ({}),
    },
  },

  data: () => ({
    error: null,
    hasLoaded: false,
    html: null,
    isLoading: false,
    classes: ['lazyload'],
  }),

  created() {
    document.addEventListener('lazybeforeunveil', this.load.bind(this));
  },

  methods: {
    async load() {
      if (!this.isLoading && !this.hasLoaded) {
        try {
          this.error = null;
          this.isLoading = true;
          const input = JSON.stringify(this.input);
          const href = `/__render-block/${this.name}?input=${encodeURIComponent(input)}`;
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
