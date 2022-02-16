<template>
  <form-group class-name="col-md-4">
    <form-label :for="id" :required="required">
      {{ label }}
    </form-label>
    <input
      :id="id"
      v-model="addressExtra"
      class="form-control"
      type="text"
      :required="required"
      :disabled="disabled"
      :placeholder="placeholder"
      autocomplete="address-extra"
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
      default: 'Extra (Apt, Suite, etc.)',
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
    id: 'sign-on-address-extra',
  }),
  computed: {
    addressExtra: {
      get() {
        return this.value || '';
      },
      set(addressExtra) {
        this.$emit('input', addressExtra || null);
      },
    },
  },
};
</script>
