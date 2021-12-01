<template>
  <div class="marko-web-p1-fii-omeda-wufoo-form">
    <p v-if="isLoading">
      Loading form...
    </p>
    <div :id="formId" />
    <div v-if="error" class="alert alert-danger">
      {{ error.message }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    formHash: { type: String, required: true },
    wufooZone: { type: String, required: true },
    omedaZone: { type: String, required: true },
    encryptedCustomerId: { type: String, default: null },
    context: { type: Object, default: () => ({}) },
    height: { type: Number, default: 1000 },
    hideHeader: { type: Boolean, default: false },
    alwaysAppendContext: { type: Boolean, default: false },
  },
  data: () => ({
    endpoint: '/__p1fii',
    error: null,
    isLoading: false,
  }),

  computed: {
    formId() {
      return `wufoo-${this.formHash}`;
    },
  },

  async mounted() {
    const [queryString] = await Promise.all([
      this.getFormQueryString(),
      this.loadWufooLibrary(),
    ]);

    const options = {
      userName: this.wufooZone,
      formHash: this.formHash,
      autoResize: true,
      height: this.height,
      defaultValues: queryString,
      ...(this.hideHeader && { header: 'hide' }),
      async: true,
      ssl: true,
    };
    const instance = new window.WufooForm();
    instance.initialize(options);
    instance.display();
  },

  methods: {
    async loadWufooLibrary() {
      if (!window.WufooForm) {
        await (new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://secure.wufoo.com/scripts/embed/form.js';
          s.async = 1;
          s.onerror = () => reject(new Error('Unable to load Wufoo form script.'));
          s.onload = resolve;
          const scr = document.getElementsByTagName('script')[0];
          scr.parentNode.insertBefore(s, scr);
        }));
      }
    },
    async getFormQueryString() {
      try {
        this.error = null;
        this.isLoading = true;
        const { encryptedCustomerId } = this;
        const params = {
          for: this.wufooZone,
          using: this.omedaZone,
          formHash: this.formHash,
          ...(encryptedCustomerId && { encryptedCustomerId }),
          context: this.context,
          alwaysAppendContext: this.alwaysAppendContext,
        };
        const res = await fetch(this.endpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            action: 'form.wufoo.prepopWithOmeda',
            params,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message);
        return json.data.query;
      } catch (e) {
        const { error } = console;
        error(e);
        this.error = e;
        return '';
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>
