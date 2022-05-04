<template>
  <button
    :class="className"
    type="button"
    :aria-label="buttonLabel"
    @click="toggle"
  >
    <span v-if="calcBefore">
      {{ calcBefore }}
    </span>
    <component :is="icon" :modifiers="iconModifiers" />
    <span v-if="calcAfter">
      {{ calcAfter }}
    </span>
  </button>
</template>

<script>
import IconChevronDown from '@parameter1/base-cms-marko-web-icons/browser/chevron-down.vue';
import IconChevronUp from '@parameter1/base-cms-marko-web-icons/browser/chevron-up.vue';
import IconDash from '@parameter1/base-cms-marko-web-icons/browser/dash.vue';
import IconMail from '@parameter1/base-cms-marko-web-icons/browser/mail.vue';
import IconPlus from '@parameter1/base-cms-marko-web-icons/browser/plus.vue';
import IconThreeBars from '@parameter1/base-cms-marko-web-icons/browser/three-bars.vue';
import IconX from '@parameter1/base-cms-marko-web-icons/browser/x.vue';
import EventBus from '@parameter1/base-cms-marko-web/browser/event-bus';

const validateIcon = v => ['chevron-down', 'chevron-up', 'dash', 'mail', 'plus', 'three-bars', 'x'].includes(v);

export default {
  components: {
    IconChevronDown,
    IconChevronUp,
    IconDash,
    IconMail,
    IconPlus,
    IconThreeBars,
    IconX,
  },
  props: {
    className: {
      type: String,
      default: null,
    },
    initiallyExpanded: {
      type: Boolean,
      default: false,
    },
    targets: {
      type: Array,
      default: () => [],
    },
    toggleClass: {
      type: String,
      required: true,
    },
    iconModifiers: {
      type: Array,
      default: () => [],
    },
    buttonLabel: {
      type: String,
      default: 'Toggle Menu',
    },
    iconName: {
      type: String,
      default: 'three-bars',
      validator: validateIcon,
    },
    expandedIconName: {
      type: String,
      default: 'x',
      validator: validateIcon,
    },
    before: {
      type: String,
      default: null,
    },
    beforeExpanded: {
      type: String,
      default: null,
    },
    beforeCollapsed: {
      type: String,
      default: null,
    },
    after: {
      type: String,
      default: null,
    },
    afterExpanded: {
      type: String,
      default: null,
    },
    afterCollapsed: {
      type: String,
      default: null,
    },
  },
  data: () => ({
    expanded: false,
  }),
  computed: {
    calcBefore() {
      const {
        before,
        beforeExpanded,
        beforeCollapsed,
        expanded,
      } = this;
      if (expanded && beforeExpanded) return beforeExpanded;
      if (!expanded && beforeCollapsed) return beforeCollapsed;
      return before;
    },
    calcAfter() {
      const {
        after,
        afterExpanded,
        afterCollapsed,
        expanded,
      } = this;
      if (expanded && afterExpanded) return afterExpanded;
      if (!expanded && afterCollapsed) return afterCollapsed;
      return after;
    },
    icon() {
      if (this.expanded) return `icon-${this.expandedIconName}`;
      return `icon-${this.iconName}`;
    },
  },
  created() {
    this.expanded = this.initiallyExpanded;
  },
  methods: {
    toggle() {
      this.expanded = !this.expanded;
      EventBus.$emit('site-menu-expanded', this.expanded);
      const elements = document.querySelectorAll(this.targets.join(','));
      Array.prototype.forEach.call(elements, el => el.classList.toggle(this.toggleClass));
    },
  },
};
</script>
