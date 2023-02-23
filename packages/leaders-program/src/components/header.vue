<template>
  <div v-if="display" class="leaders__header">
    <div v-if="imgSrc" class="leaders__header-image">
      <img
        :src="imgSrc"
        :srscet="`${imgSrc}&dpr=2 2x`"
        :alt="imgAlt"
        :width="imgWidth"
        :height="imgHeight"
      >
    </div>
    <div v-if="displayCallout" class="leaders__header-callout">
      <div class="leaders__callout-prefix">
        {{ calloutPrefix }}
      </div>
      <div class="leaders__callout-value">
        {{ calloutValue }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    display: {
      type: Boolean,
      default: true,
    },
    imgSrc: {
      type: String,
      default: null,
    },
    imgAlt: {
      type: String,
      default: null,
    },
    imgWidth: {
      type: String,
      default: '300',
    },
    imgHeight: {
      type: String,
      default: '90',
    },
    displayCallout: {
      type: Boolean,
      default: true,
    },
    calloutPrefix: {
      type: String,
      default: 'Browse these',
    },
    calloutValue: {
      type: String,
      default: 'leading suppliers',
    },
  },
};
</script>
