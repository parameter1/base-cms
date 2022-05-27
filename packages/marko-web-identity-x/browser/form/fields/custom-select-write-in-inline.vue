<template>
  <input
    v-model="answer.writeInValue"
    class="form-control form-control-sm"
    type="text"
    :required="required"
    :placeholder="placeholder"
    :autofocus="autofocus"
    autocomplete="off"
  >
</template>

<script>

export default {
  props: {
    required: {
      type: Boolean,
      default: false,
    },
    answer: {
      type: Object,
      required: true,
    },
    placeholder: {
      type: String,
      default: '',
    },
  },
  computed: {
    id() {
      return `custom-select-write-in-${this.answer.id}`;
    },
    autofocus() {
      return this.answer && !this.answer.writeInValue;
    },
  },
};
</script>
