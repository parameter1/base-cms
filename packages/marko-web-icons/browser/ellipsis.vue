<template>
  <icon-wrapper
    name="ellipsis"
    :tag="tag"
    :block-name="blockName"
    :class-name="className"
    :modifiers="modifiers"
  >
    <!-- eslint-disable-next-line -->
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="16" viewBox="0 0 12 16"><path fill-rule="evenodd" d="M11 5H1c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h10c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1zM4 9H2V7h2v2zm3 0H5V7h2v2zm3 0H8V7h2v2z"/></svg>
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
