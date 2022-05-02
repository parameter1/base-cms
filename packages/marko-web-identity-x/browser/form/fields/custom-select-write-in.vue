<template>
  <form-group>
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
  </form-group>
</template>

<script>
import FormGroup from '../common/form-group.vue';
import FormLabel from '../common/form-label.vue';

export default {
  components: {
    FormGroup,
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
