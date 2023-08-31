<template>
  <icon-wrapper
    name="check-circle"
    :tag="tag"
    :block-name="blockName"
    :class-name="className"
    :modifiers="modifiers"
  >
    <!-- eslint-disable-next-line -->
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path style="fill:none;stroke:#10182A;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;" d="M9.2,12.8l2.2,2.2l3.8-5.2 M21.2,12.1c0,5-4,9-9,9c-5,0-9-4-9-9c0-5,4-9,9-9C17.2,3.1,21.2,7.1,21.2,12.1z"/></svg>
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
