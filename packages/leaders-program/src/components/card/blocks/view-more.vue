<template>
  <common-link :href="href" :target="target" @click="emitClick">
    {{ value }} &raquo;
  </common-link>
</template>

<script>
import i18n from '../../../utils/i18n-vue';
import CommonLink from '../../common/link.vue';

export default {
  components: { CommonLink },

  props: {
    href: {
      type: String,
      required: true,
    },
    target: {
      type: String,
      default: '_self',
    },
    label: {
      type: String,
      default: null,
    },
    lang: {
      type: String,
      default: 'en',
    },
    prefix: {
      type: String,
      default: 'View more',
    },
  },

  computed: {
    value() {
      const { prefix, label, lang } = this;
      if (this.lang !== 'en') {
        const translatedPrefix = i18n(lang, prefix.toLowerCase());
        const translatedLabel = i18n(lang, label.toLowerCase());
        return [translatedPrefix, translatedLabel].filter((v) => v).join(' ');
      }
      return [prefix, label].filter((v) => v).join(' ');
    },
  },

  methods: {
    emitClick(data, event) {
      this.$emit('click', {
        sourceLabel: this.value,
        ...data,
      }, event);
    },
  },
};
</script>
