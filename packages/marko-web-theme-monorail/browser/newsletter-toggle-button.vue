<template>
  <button
    class="site-navbar__newsletter-toggler"
    type="button"
    @click="toggle"
  >
    <icon-mail :modifiers="['lg']" />
  </button>
</template>

<script>
import IconMail from '@parameter1/base-cms-marko-web-icons/browser/mail.vue';

export default {
  inject: ['EventBus'],
  components: {
    IconMail,
  },

  data: () => ({
    expanded: false,
  }),

  methods: {
    toggle() {
      this.expanded = !this.expanded;
      this.EventBus.$emit('newsletter-menu-expanded', this.expanded);
    },
  },
};
</script>
