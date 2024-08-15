<template>
  <form-group :class-name="className">
    <form-label :for="id" :required="required">
      {{ label }}
    </form-label>
    <input
      :id="id"
      v-model="customText"
      class="form-control"
      type="text"
      :required="required"
      @change="$emit('change', customText)"
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
    /**
     * The unique field id.
     */
    id: {
      type: String,
      required: true,
    },
    required: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: 'Custom Input',
    },
    value: {
      type: String,
      default: '',
    },
    className: {
      type: String,
      default: 'col-md-12',
    },
  },
  computed: {
    customText: {
      get() {
        return this.value || '';
      },
      set(customText) {
        this.$emit('change', customText);
      },
    },
  },
};
</script>
