<template>
  <button
    :class="buttonClass"
    type="button"
    aria-label="Newsletter Menu Toggle"
    @click="toggle"
  >
    <component :is="icon" :modifiers="iconModifiers" />
  </button>
</template>

<script>
import IconMail from '@parameter1/base-cms-marko-web-icons/browser/mail.vue';
import IconPerson from '@parameter1/base-cms-marko-web-icons/browser/person.vue';

const validateIcon = (v) => ['mail', 'person'].includes(v);

export default {
  components: {
    IconMail,
    IconPerson,
  },
  inject: ['EventBus'],
  props: {
    iconName: {
      type: String,
      default: 'mail',
      validator: validateIcon,
    },
    iconModifiers: {
      type: Array,
      default: () => ['lg'],
    },
    initiallyExpanded: {
      type: Boolean,
      default: false,
    },
    buttonClass: {
      type: String,
      default: 'site-navbar__idx-newsletter-toggler',
    },
  },

  data: () => ({
    expanded: false,
  }),

  computed: {
    icon() {
      return `icon-${this.iconName}`;
    },
  },

  mounted() {
    this.expanded = this.initiallyExpanded;
  },

  methods: {
    toggle() {
      this.expanded = !this.expanded;
      this.EventBus.$emit('idx-newsletter-menu-expanded', this.expanded);
    },
  },
};
</script>
