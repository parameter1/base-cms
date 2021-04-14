<template>
  <div class="omeda-rapid-identity-x" style="display: none;" />
</template>

<script>
const { warn } = console;

export default {
  props: {
    endpoint: {
      type: String,
      default: '/__idx/omeda-rapid-ident',
    },
    olyticsCookieName: {
      type: String,
      default: 'oly_enc_id',
    },
    idxCookieName: {
      type: String,
      default: '__idx',
    },
  },

  data: () => ({
    cookies: null,
  }),

  computed: {
    hasIdentityXUser() {
      return Boolean(this.cookies[this.idxCookieName]);
    },
    encryptedId() {
      const id = this.cookies[this.olyticsCookieName];
      // the encrypted ID cookie value is enclosed with double-quotes. remove.
      return id ? id.replace(/"/g, '') : null;
    },
  },

  created() {
    this.parseCookies();
    this.rapidIdentify();
  },

  methods: {
    async rapidIdentify() {
      if (this.hasIdentityXUser) {
        const res = await fetch(this.endpoint, { method: 'GET' });
        const { encryptedId } = await res.json();
        if (encryptedId) this.$emit('encrypted-id-found', encryptedId);
        if (encryptedId && encryptedId !== this.encryptedId) {
          // run olytics confirm to set the IdentityX user's omeda ID.
          const { olytics } = window;
          if (olytics) {
            olytics.confirm(encryptedId);
          } else {
            warn('Unable to identify IdentityX user: no olytics instance was found.');
          }
        }
      }
    },

    parseCookies() {
      if (!this.cookies) {
        this.cookies = document.cookie.split(';').reduce((o, pairs) => {
          const [key, value] = pairs.trim().split('=').map(v => decodeURIComponent(v));
          let v;
          switch (value) {
            case 'null': v = null; break;
            case 'true': v = true; break;
            case 'false': v = false; break;
            case 'undefined': v = undefined; break;
            default: v = value;
          }
          return { ...o, [key]: v };
        }, {});
      }
      return this.cookies;
    },
  },
};
</script>
