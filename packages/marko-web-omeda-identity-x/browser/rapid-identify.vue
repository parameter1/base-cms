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
        const res = await fetch(this.endpoint, { method: 'GET' });
        const json = await res.json();
        const { encryptedId } = json;
        if (encryptedId) this.$emit('encrypted-id-found', encryptedId);
        this.$emit('response', json);
      } catch (e) {
        error('IdentityX to Omeda identification failed.', e);
      }
    },
  },
};
</script>
