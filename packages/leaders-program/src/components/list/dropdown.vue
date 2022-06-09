<template>
  <div :class="classNames" :style="styles">
    <slot />
  </div>
</template>

<script>
export default {
  props: {
    isActive: {
      type: Boolean,
      default: false,
    },
    transitionsDisabled: {
      type: Boolean,
      default: true,
    },
    styles: {
      type: Object,
      default: () => ({}),
    },
    direction: {
      type: String,
      default: 'horizontal',
      validator: v => ['horizontal', 'vertical'].includes(v),
    },
    open: {
      type: String,
      default: 'auto',
      validator: v => ['above', 'below', 'left', 'right', 'auto'].includes(v),
    },
  },

  computed: {
    classNames() {
      const blockName = 'leaders-dropdown';
      const classes = [blockName, `${blockName}--${this.direction}`, `${blockName}--open-${this.open}`];
      if (this.transitionsDisabled) classes.push(`${blockName}--transitions-disabled`);
      if (this.isActive) classes.push(`${blockName}--active`);
      return classes;
    },
  },
};
</script>
