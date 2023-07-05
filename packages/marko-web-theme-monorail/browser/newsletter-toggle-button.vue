<template>
  <button
    class="site-navbar__newsletter-toggler"
    type="button"
    aria-label="Newsletter Menu Toggle"
    @click="toggle"
  >
    <icon-mail :modifiers="['lg']" />
  </button>
</template>

<script>
import IconMail from '@parameter1/base-cms-marko-web-icons/browser/mail.vue';

export default {
  components: {
    IconMail,
  },
  inject: ['EventBus'],
  props: {
    initiallyExpanded: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    expanded: false,
  }),

  mounted() {
    this.expanded = this.initiallyExpanded;
  },

  methods: {
    toggle() {
      this.expanded = !this.expanded;
      this.EventBus.$emit('newsletter-menu-expanded', this.expanded);
    },
  },
};
</script>
