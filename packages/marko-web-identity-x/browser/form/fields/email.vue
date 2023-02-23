<template>
  <form-group>
    <form-label :for="id" :required="true">
      {{ label }}
    </form-label>
    <input
      :id="id"
      v-model="email"
      class="form-control"
      type="email"
      :required="true"
      :disabled="disabled"
      :placeholder="placeholder"
      autocomplete="email"
      @focus="$emit('focus')"
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
    id: {
      type: String,
      default: 'sign-on-email',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: 'Email Address',
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
  computed: {
    email: {
      get() {
        return this.value || '';
      },
      set(email) {
        this.$emit('input', email || null);
      },
    },
  },
};
</script>
