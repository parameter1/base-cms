<template>
  <button
    class="text-nowrap"
    type="submit"
    :disabled="isLoading || disabled"
  >
    <div class="d-flex align-items-center">
      <div
        v-show="isLoading"
        class="spinner-border spinner-border-sm text-light mr-1"
        role="status"
      >
        <span class="sr-only">Loading...</span>
      </div>
      <span v-if="label">{{ label }}</span>
      <span v-else>{{ translate("signUp") }}</span>
    </div>
  </button>
</template>


<script>
import i18n from '../i18n-vue';

export default {
  props: {
    isLoading: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    lang: {
      type: String,
      default: 'en',
    },
  },
  methods: {
    translate(key) {
      return i18n(this.lang, key);
    },
  },
};
</script>
