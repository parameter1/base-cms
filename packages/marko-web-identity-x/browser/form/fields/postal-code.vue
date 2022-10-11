<template>
  <form-group :class-name="className">
    <form-label :for="id" :required="required">
      {{ translate("zipLabel") }}
    </form-label>
    <input
      :id="id"
      v-model="postalCode"
      class="form-control"
      type="text"
      :required="required"
      :disabled="disabled"
      :placeholder="placeholder"
      autocomplete="postal-code"
    >
  </form-group>
</template>

<script>
import FormGroup from '../common/form-group.vue';
import FormLabel from '../common/form-label.vue';
import i18n from '../../../i18n';

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
      default: '',
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
      default: 'col-md-12',
    },
  },
  data: () => ({
    id: 'sign-on-postal-code',
  }),
  computed: {
    postalCode: {
      get() {
        return this.value || '';
      },
      set(postalCode) {
        this.$emit('input', postalCode || null);
      },
    },
  },
  methods: {
    translate(key) {
      if (this.label) return this.label;
      return i18n(this.lang, key);
    },
  },
};
</script>
