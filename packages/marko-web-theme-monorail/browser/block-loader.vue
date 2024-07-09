<template>
  <div class="lazyload">
    <div v-if="isLoading">
      Loading {{ label }}...
    </div>
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
    isLoading: false,
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
          const html = await res.text();
          this.hasLoaded = true;
          const template = document.createElement('template');
          template.innerHTML = html;
          const toInsert = template.content.firstChild || '';
          this.$el.replaceWith(toInsert);
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
