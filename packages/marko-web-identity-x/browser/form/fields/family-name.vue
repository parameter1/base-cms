<template>
  <form-group :class-name="className">
    <form-label :for="id" :required="required">
      {{ label }}
    </form-label>
    <input
      :id="id"
      v-model="familyName"
      class="form-control"
      type="text"
      :required="required"
      :disabled="disabled"
      :placeholder="placeholder"
      autocomplete="family-name"
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
    disabled: {
      type: Boolean,
      default: false,
    },
    required: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: 'Last Name',
    },
    placeholder: {
      type: String,
      default: '',
    },
    value: {
      type: String,
      default: '',
    },
    className: {
      type: String,
      default: '',
    },
  },
  data: () => ({
    id: 'sign-on-family-name',
  }),
  computed: {
    familyName: {
      get() {
        return this.value || '';
      },
      set(familyName) {
        this.$emit('input', familyName || null);
      },
    },
  },
};
</script>
