<template>
  <icon-wrapper
    name="listennotes"
    :tag="tag"
    :block-name="blockName"
    :class-name="className"
    :modifiers="modifiers"
  >
    <!-- eslint-disable-next-line -->
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M1300 2794 c-14 -2 -65 -9 -115 -15 -180 -22 -413 -115 -583 -231 -108 -74 -258 -222 -336 -331 -123 -172 -217 -402 -247 -602 -18 -119 -16 -337 4 -455 49 -285 194 -558 405 -762 163 -157 346 -265 558 -332 144 -44 260 -61 424 -60 157 1 287 21 420 64 354 116 656 375 819 706 100 201 143 386 145 614 1 164 -16 280 -60 423 -71 226 -194 427 -362 589 -259 249 -566 379 -932 392 -63 3 -126 3 -140 0z m410 -159 c493 -127 858 -524 946 -1029 25 -140 15 -378 -21 -516 -119 -458 -467 -806 -925 -925 -138 -36 -376 -46 -516 -21 -507 88 -901 452 -1030 952 -26 101 -28 123 -29 299 0 123 5 211 14 250 108 485 441 845 906 980 128 37 199 44 385 40 138 -3 182 -8 270 -30z"/></svg>
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
