<template>
  <fieldset class="csmulti-group">
    <legend class="csmulti-legend">
      {{ label }}
    </legend>
    <div class="pl-3 pb-2">
      <slot />
    </div>
  </fieldset>
</template>

<script>
export default {
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: '',
    },
  },
};
</script>
