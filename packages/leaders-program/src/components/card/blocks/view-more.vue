<template>
  <common-link :href="href" :target="target" @click="emitClick">
    {{ value }} &raquo;
  </common-link>
</template>

<script>
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
    prefix: {
      type: String,
      default: 'View more',
    },
  },

  computed: {
    value() {
      const { prefix, label } = this;
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
