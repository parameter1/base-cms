<template>
  <button
    :class="className"
    type="button"
    :aria-label="buttonLabel"
    @click="close"
  >
    <icon-x :modifiers="iconModifiers" />
  </button>
</template>

<script>
import IconX from '@parameter1/base-cms-marko-web-icons/browser/x.vue';

export default {
  components: {
    IconX,
  },
  props: {
    className: {
      type: String,
      default: null,
    },
    targetButton: {
      type: String,
      required: true,
    },
    iconModifiers: {
      type: Array,
      default: () => [],
    },
    buttonLabel: {
      type: String,
      default: 'Close Newsletter Menu',
    },
  },
  methods: {
    close() {
      const element = document.querySelector(this.targetButton);
      if (element) element.click();
    },
  },
};
</script>
