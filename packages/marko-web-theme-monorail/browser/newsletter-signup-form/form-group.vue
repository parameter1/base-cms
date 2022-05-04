<template>
  <div :class="classes">
    <label
      :class="`${blockName}__form-label`"
      :for="id"
    >
      {{ displayLabel }}
    </label>
    <slot :id="id" :required="required" />
  </div>
</template>

<script>
export default {
  props: {
    field: {
      type: String,
      required: true,
    },
    blockName: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    required: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    id() {
      return `nl-complete-signup-${this.field}`;
    },

    classes() {
      const element = `${this.blockName}__form-group`;
      return [element, `${element}--${this.field}`];
    },
    displayLabel() {
      const parts = [this.label];
      if (this.required) parts.push('*');
      return parts.join(' ');
    },
  },
};
</script>
