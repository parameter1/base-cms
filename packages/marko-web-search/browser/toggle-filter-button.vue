<template>
  <button
    :class="className"
    type="button"
    :aria-label="buttonLabel"
    @click="toggle"
  >
    <span>{{ label }}</span>
    <component :is="icon" />
  </button>
</template>

<script>
import IconChevronDown from '@parameter1/base-cms-marko-web-icons/browser/chevron-down.vue';
import IconChevronUp from '@parameter1/base-cms-marko-web-icons/browser/chevron-up.vue';

export default {
  components: {
    IconChevronDown,
    IconChevronUp,
  },
  props: {
    className: {
      type: String,
      default: 'marko-web-search-toggle-filter',
    },
    target: {
      type: String,
      required: true,
    },
    toggleClass: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
  },
  data: () => ({
    expanded: true,
    iconName: 'chevron-up',
    expandedIconName: 'chevron-down',
  }),

  computed: {
    buttonLabel() {
      return `Toggle ${this.label} Filter`;
    },
    icon() {
      if (this.expanded) return `icon-${this.expandedIconName}`;
      return `icon-${this.iconName}`;
    },
  },

  watch: {
    expanded() {
      const element = document.querySelector(this.target);
      element.classList.toggle(this.toggleClass);
    },
  },

  methods: {
    toggle() {
      this.expanded = !this.expanded;
    },
  },
};
</script>
