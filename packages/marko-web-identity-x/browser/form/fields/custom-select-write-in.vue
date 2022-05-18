<template>
  <div class="input-group">
    <div class="input-group-prepend w-25">
      <div class="input-group-text d-inline-block text-truncate w-100" :title="label">
        {{ label }}
      </div>
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
  </div>
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
    autofocus() {
      return this.answer && !this.answer.writeInValue;
    },
  },
};
</script>
