<template>
  <form-group :class-name="classNames">
    <form-label :for="id" :required="required">
      {{ label }}
    </form-label>
    <input
      :id="id"
      v-model="city"
      class="form-control"
      type="text"
      :required="required"
      :disabled="disabled"
      :placeholder="placeholder"
      autocomplete="city"
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
      default: 'City',
    },
    placeholder: {
      type: String,
      default: '',
    },
    value: {
      type: String,
      default: '',
    },
    halfWidth: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    id: 'sign-on-city',
  }),
  computed: {
    classNames() {
      const { halfWidth } = this;
      return halfWidth ? 'col-md-6' : 'col-md-4';
    },
    city: {
      get() {
        return this.value || '';
      },
      set(city) {
        this.$emit('input', city || null);
      },
    },
  },
};
</script>
