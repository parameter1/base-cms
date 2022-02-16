<template>
  <div :class="classNames">
    <form-group>
      <form-label :for="id" :required="required">
        {{ label }}
      </form-label>
      <input
        :id="id"
        v-model="street"
        class="form-control"
        type="text"
        :required="required"
        :disabled="disabled"
        :placeholder="placeholder"
        autocomplete="street"
      >
    </form-group>
  </div>
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
      default: 'Street',
    },
    placeholder: {
      type: String,
      default: '',
    },
    value: {
      type: String,
      default: '',
    },
    fullWidth: {
      type: Boolean,
      default: true,
    },
  },
  data: () => ({
    id: 'sign-on-street',
  }),
  computed: {
    classNames() {
      const { fullWidth } = this;
      return fullWidth ? 'col-md-12' : 'col-md-9';
    },
    street: {
      get() {
        return this.value || '';
      },
      set(street) {
        this.$emit('input', street || null);
      },
    },
  },
};
</script>
