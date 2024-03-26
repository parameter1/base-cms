<template>
  <icon-wrapper
    name="deezer"
    :tag="tag"
    :block-name="blockName"
    :class-name="className"
    :modifiers="modifiers"
  >
    <!-- eslint-disable-next-line -->
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M216 941 c-8 -9 -21 -40 -27 -69 -13 -56 -23 -59 -32 -12 -4 17 -13 30 -21 30 -28 0 -41 -77 -40 -250 0 -136 3 -172 18 -205 l17 -40 20 24 c17 21 19 21 19 4 0 -39 32 -139 50 -158 25 -25 37 -14 59 56 l18 52 12 -88 c14 -100 34 -159 53 -153 7 3 20 27 30 54 l16 49 7 -40 c21 -121 58 -202 88 -193 20 6 57 92 71 164 l13 69 12 -40 c17 -59 26 -71 44 -56 18 14 34 78 46 171 l7 65 12 -42 c7 -22 21 -52 32 -65 20 -23 20 -23 35 -3 19 24 45 109 45 147 0 32 15 38 23 8 8 -30 23 -24 38 13 18 47 23 328 7 397 -16 65 -37 72 -55 20 -12 -37 -12 -36 -32 35 -6 22 -17 49 -25 60 -11 16 -16 17 -29 6 -17 -13 -41 -80 -53 -146 l-7 -40 -14 55 c-34 132 -70 87 -98 -124 l-7 -50 -21 55 c-19 45 -26 54 -47 54 -20 0 -30 -10 -51 -53 l-25 -52 -13 91 c-13 101 -34 163 -53 157 -13 -5 -30 -46 -44 -103 -6 -27 -8 -24 -20 35 -25 115 -46 146 -78 111z"/></svg>
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
