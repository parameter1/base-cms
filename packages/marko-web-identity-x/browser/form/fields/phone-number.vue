<template>
  <form-group>
    <form-label :for="id" :required="required">
      {{ label }}
    </form-label>
    <input
      :id="id"
      v-model="phoneNumber"
      class="form-control"
      type="tel"
      :required="required"
      :disabled="disabled"
      :placeholder="placeholder"
      autocomplete="phone"
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
      default: 'Phone Number',
    },
    placeholder: {
      type: String,
      default: '',
    },
    value: {
      type: String,
      default: '',
    },
  },
  data: () => ({
    id: 'sign-on-phone',
  }),
  computed: {
    phoneNumber: {
      get() {
        return this.value || '';
      },
      set(phoneNumber) {
        this.$emit('input', phoneNumber || null);
      },
    },
  },
};
</script>
