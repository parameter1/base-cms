<template>
  <icon-wrapper
    name="stitcher"
    :tag="tag"
    :block-name="blockName"
    :class-name="className"
    :modifiers="modifiers"
  >
    <!-- eslint-disable-next-line -->
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M19.59 8.516H24v6.928h-4.41zM0 8.854h4.41v7.803H0zm4.914-1.328h4.388v8.572H4.914zm4.892.725h4.388v8.81H9.806zm4.892-1.312h4.388v9.158h-4.388Z"/></svg>
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
