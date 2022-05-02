<template>
  <div class="mt-2">
    <form-label v-if="label" :for="id" :required="required">
      {{ label }}
    </form-label>
    <input
      :id="id"
      v-model="answer.writeInValue"
      class="form-control"
      type="text"
      :required="required"
      :placeholder="placeholder"
      autocomplete="off"
    >
  </div>
</template>

<script>
import FormLabel from '../common/form-label.vue';

export default {
  components: {
    FormLabel,
  },
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
  },
};
</script>
