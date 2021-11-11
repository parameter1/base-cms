<template>
  <div class="omeda-rapid-identity-x" style="display: none;" />
</template>

<script>
const { error } = console;

export default {
  props: {
    endpoint: {
      type: String,
      default: '/__idx/omeda-rapid-ident',
    },
  },

  created() {
    this.rapidIdentify();
  },

  methods: {
    async rapidIdentify() {
      try {
        await fetch(this.endpoint, { method: 'GET' });
      } catch (e) {
        error('IdentityX to Omeda identification failed.', e);
      }
    },
  },
};
</script>
