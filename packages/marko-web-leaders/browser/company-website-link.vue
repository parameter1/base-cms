<template>
  <a
    :href="href"
    target="_blank"
    class="btn btn-sm btn-primary btn-block"
    title="Visit Site"
    rel="nofollow"
    @click="emitAction"
  >
    Visit Site
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
      };
      this.$emit('action', payload, data);
    },
  },
};
</script>
