<template>
  <form-group>
    <form-label :for="id" :required="required">
      {{ translate("familyNameLabel") }}
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
    lang: {
      type: String,
      default: 'en',
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
  methods: {
    translate(key) {
      if (this.label) return this.label;
      return i18n(this.lang, key);
    },
  },
};
</script>
