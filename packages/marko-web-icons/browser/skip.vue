<template>
  <icon-wrapper
    name="skip"
    :tag="tag"
    :block-name="blockName"
    :class-name="className"
    :modifiers="modifiers"
  >
    <!-- eslint-disable-next-line -->
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M5.79 11.624l-1.326-.088-.088-1.326 5.834-5.834 1.326.088.088 1.326-5.834 5.834zM8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm5.5-7a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/></svg>
  </icon-wrapper>
</template>

<script>
import IconWrapper from './_wrapper.vue';

export default {
  components: { IconWrapper },
  props: {
    blockName: {
      type: String,
      default: 'marko-web-icon',
    },
    className: {
      type: String,
      default: null,
    },
    modifiers: {
      type: Array,
      default: () => ([]),
    },
    tag: {
      type: String,
      default: 'span',
    },
  },
};
</script>
