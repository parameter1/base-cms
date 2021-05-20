<template>
  <a
    :href="href"
    target="_blank"
    class="btn btn-sm btn-primary btn-block"
    title="Visit Site"
    rel="nofollow"
    @click="emitAction"
  >
    {{ label }}
  </a>
</template>

<script>
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
    label: {
      type: String,
      required: false,
      default: 'Visit Site',
    },
  },
  methods: {
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
