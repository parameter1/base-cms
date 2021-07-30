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
      default: 'marko-web-search-toggle-filter-container',
    },
    openMediaQuery: {
      type: String,
      default: '(min-width: 992px)',
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
      default: 'Filters',
    },
    buttonLabel: {
      type: String,
      default: 'Toggle Filters',
    },
  },
  data: () => ({
    expanded: false,
    iconName: 'chevron-up',
    expandedIconName: 'chevron-down',
  }),

  computed: {
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

  mounted() {
    const mql = window.matchMedia(this.openMediaQuery);
    this.handleMediaQueryState(mql.matches);
    mql.addEventListener('change', ({ matches }) => {
      this.handleMediaQueryState(matches);
    });
  },

  methods: {
    handleMediaQueryState(matches) {
      this.expanded = matches;
    },

    toggle() {
      this.hasUserInteraction = true;
      this.expanded = !this.expanded;
    },
  },
};
</script>
