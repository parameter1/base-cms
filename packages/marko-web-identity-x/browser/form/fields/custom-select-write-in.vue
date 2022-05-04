<template>
  <div class="input-group">
    <div class="input-group-prepend">
      <div class="input-group-text">{{ label }}</div>
    </div>

    <input
      :id="id"
      v-model="answer.writeInValue"
      class="form-control"
      type="text"
      :required="required"
      :placeholder="placeholder"
      :autofocus="autofocus"
      autocomplete="off"
    >

    <div class="input-group-append">
      <button
        type="button"
        class="btn btn-outline-secondary"
        @click="$emit('clear', answer.id)"
      >
        Clear
      </button>
    </div>
  </div>
</template>

<script>

export default {
  props: {
    required: {
      type: Boolean,
      default: false,
    },
    selected: {
      type: Array,
      required: true,
    },
    placeholder: {
      type: String,
      default: '',
    },
    value: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
  },
  computed: {
    id() {
      return `custom-select-write-in-${this.answer.id}`;
    },
    answer() {
      return this.selected[0];
    },
    autofocus() {
      return this.answer && !this.answer.writeInValue;
    },
  },
};
</script>
