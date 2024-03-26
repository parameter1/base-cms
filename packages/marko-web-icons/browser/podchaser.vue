<template>
  <icon-wrapper
    name="podchaser"
    :tag="tag"
    :block-name="blockName"
    :class-name="className"
    :modifiers="modifiers"
  >
    <!-- eslint-disable-next-line -->
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M883 1989 c-293 -38 -560 -205 -721 -451 -107 -165 -155 -331 -155 -538 0 -212 49 -378 164 -550 235 -351 671 -519 1074 -415 352 92 632 371 720 719 89 353 -13 709 -278 963 -163 156 -357 247 -587 273 -96 11 -128 11 -217 -1z m329 -153 c384 -98 648 -437 648 -836 0 -228 -80 -426 -238 -592 -170 -178 -381 -268 -625 -268 -97 0 -139 6 -234 31 l-43 12 0 109 c0 101 1 110 18 103 120 -51 272 -67 392 -41 213 45 399 207 471 411 57 163 47 331 -30 492 -58 121 -170 233 -291 291 -100 47 -171 64 -280 64 -109 0 -180 -17 -280 -64 -120 -57 -233 -170 -290 -289 -62 -129 -70 -193 -70 -536 0 -336 5 -323 -79 -197 -57 84 -105 202 -128 312 -23 116 -14 300 22 412 93 293 324 515 615 589 115 29 299 28 422 -3z"/></svg>
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
