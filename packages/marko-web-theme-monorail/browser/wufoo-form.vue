<template>
  <div :id="formId" />
</template>

<script>

export default {
  props: {
    formHash: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    height: {
      type: String,
      default: '1000',
    },
  },
  data: () => ({ canDownload: false }),
  computed: {
    formId() {
      return `wufoo-${this.formHash}`;
    },
    formUrl() {
      return `https://${this.userName}.wufoo.com/forms/${this.formHash}`;
    },
  },
  async mounted() {
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
    this.init();
  },
  methods: {
    init() {
      const options = {
        userName: this.userName,
        formHash: this.formHash,
        autoResize: true,
        header: 'hide',
        height: this.height,
        async: true,
        ssl: true,
      };
      const instance = new window.WufooForm();
      instance.initialize(options);
      instance.display();
    },
  },
};
</script>
