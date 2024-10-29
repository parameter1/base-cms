<template>
  <a
    :href="href"
    target="_blank"
    class="btn btn-sm btn-primary btn-block"
    title="Visit Site"
    rel="nofollow"
    @click="emitAction"
  >
    {{ translate("visitSiteLabel") }}
  </a>
</template>

<script>
import i18n from '@parameter1/base-cms-leaders-program/src/utils/i18n-vue';

export default {
  props: {
    companyId: {
      type: Number,
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    href: {
      type: String,
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
    emitAction() {
      const payload = {
        category: 'Leaders Company Profile',
        type: 'click',
        label: 'Company Website',
      };
      const data = {
        companyId: this.companyId,
        companyName: this.companyName,
        href: this.href,
      };
      this.$emit('action', payload, data);
    },
  },
};
</script>
