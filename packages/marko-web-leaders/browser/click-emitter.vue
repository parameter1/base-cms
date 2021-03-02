<template>
  <div class="marko-web-leaders-click-emitter" style="display: none;" />
</template>

<script>
import { delegate } from 'dom-utils';

export default {
  data: () => ({
    listener: null,
  }),

  created() {
    this.listener = delegate(
      document,
      'click',
      'a[data-leaders-action]',
      this.emit.bind(this),
    );
  },

  beforeDestroy() {
    if (this.listener) this.listener.destroy();
  },

  methods: {
    emit(_, link) {
      const event = {
        type: link.getAttribute('data-leaders-action'),
        category: link.getAttribute('data-leaders-category'),
        label: link.getAttribute('data-leaders-label'),
      };

      const payload = {
        ...this.parseJSON(link.getAttribute('data-leaders-payload')),
        href: link.getAttribute('href'),
      };
      this.$emit('action', event, payload);
    },

    parseJSON(value) {
      try {
        return JSON.parse(value) || {};
      } catch (e) {
        return {};
      }
    },
  },
};
</script>
