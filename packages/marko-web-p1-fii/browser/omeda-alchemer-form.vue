<template>
  <div class="marko-web-p1-fii-omeda-alchemer-form">
    <p v-if="isLoading">
      Loading form...
    </p>
    <iframe
      v-show="url"
      :id="formId"
      :src="url"
      frameborder="0"
      style="width: 1px; min-width: 100%; border: none;"
    />
    <div v-if="error" class="alert alert-danger">
      {{ error.message }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    surveyId: { type: [Number, String], required: true },
    alchemerZone: { type: [Number, String], required: true },
    omedaZone: { type: String, required: true },
    encryptedCustomerId: { type: String, default: null },
    context: { type: Object, default: () => ({}) },
    height: { type: Number, default: 1000 },
    width: { type: Number, default: 500 },
    debugIframe: { type: Boolean, default: false },
    alwaysAppendContext: { type: Boolean, default: false },
  },
  data: () => ({
    endpoint: '/__p1fii',
    error: null,
    isLoading: false,
    url: null,
  }),

  computed: {
    formId() {
      return `alchemer-${this.surveyId}`;
    },
  },

  async mounted() {
    const [url] = await Promise.all([
      this.getFormUrl(),
      this.loadResizerLibrary(),
    ]);
    this.url = url;
    window.iFrameResize({
      checkOrigin: ['https://survey.alchemer.com'],
      heightCalculationMethod: 'taggedElement',
      log: this.debugIframe,
    }, `#${this.formId}`);
  },

  methods: {
    async loadResizerLibrary() {
      if (!window.iFrameResize) {
        await (new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.3.2/iframeResizer.min.js';
          s.async = 1;
          s.onerror = () => reject(new Error('Unable to load resizer form script.'));
          s.onload = resolve;
          const scr = document.getElementsByTagName('script')[0];
          scr.parentNode.insertBefore(s, scr);
        }));
      }
    },
    async getFormUrl() {
      try {
        this.error = null;
        this.isLoading = true;
        const { encryptedCustomerId } = this;
        const params = {
          for: `${this.alchemerZone}`,
          using: this.omedaZone,
          surveyId: parseInt(this.surveyId, 10),
          ...(encryptedCustomerId && { encryptedCustomerId }),
          context: this.context,
          alwaysAppendContext: this.alwaysAppendContext,
        };
        const res = await fetch(this.endpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            action: 'form.alchemer.prepopWithOmeda',
            params,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message);
        return json.data.url;
      } catch (e) {
        const { error } = console;
        this.error = e;
        error(e);
        return null;
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>
