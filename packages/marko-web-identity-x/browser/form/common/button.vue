<template>
  <button
    class="btn"
    :class="[`btn-${color}`, disabled ? 'disabled' : '']"
    :type="type"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script>
export default {
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: 'default',
      validator: v => ['primary', 'secondary', 'default'].includes(v),
    },
    type: {
      type: String,
      default: 'submit',
      validator: v => ['reset', 'button', 'submit'].includes(v),
    },
  },

  computed: {
    buttonClasses() {
      if (this.disabled) return ['disabled', 'btn-disabled'];
      return `btn-${this.color}`;
    },
  },
};
</script>
