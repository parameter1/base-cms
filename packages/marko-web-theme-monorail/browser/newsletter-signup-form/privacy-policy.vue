<template>
  <div :class="`${blockName}__privacy-policy`">
    {{ translate("emailProviding") }}
    <a :href="privacyPolicyLink.href" :target="privacyPolicyLink.target" rel="noopener">
      {{ privacyPolicyLink.label }}</a>.
    {{ translate("protectedBy") }}
    <a href="https://policies.google.com/privacy">{{ translate("privacyPolicy") }}</a>
    {{ translate("and") }}
    <a href="https://policies.google.com/terms">{{ translate("termsOfService") }}</a>
    {{ translate("apply") }}
  </div>
</template>

<script>
import i18n from '../i18n-vue';

export default {
  props: {
    blockName: {
      type: String,
      required: true,
    },
    privacyPolicyLink: {
      type: Object,
      required: true,
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
