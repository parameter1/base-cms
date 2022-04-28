<template>
  <div class="inline-newsletter-form">
    <div ref="lazyload" class="lazyload" />
    <step-1
      v-if="step === 1"
      :newsletter="defaultNewsletter"
      :name="name"
      :description="description"
      :disabled="disabled"
      :image-src="imageSrc"
      :image-srcset="imageSrcset"
      :recaptcha-site-key="recaptchaSiteKey"
      :privacy-policy-link="privacyPolicyLink"
      :lang="lang"
      @submit="stepOneSubmit"
      @subscribe="$emit('subscribe', $event)"
      @focus="$emit('focus', { step: 1 })"
      @error="$emit('error', { step: 1, error: $event })"
    />
    <step-2
      v-if="step === 2"
      :site-name="siteName"
      :email="email"
      :default-newsletter="defaultNewsletter"
      :newsletters="newsletters"
      :demographic="demographic"
      :recaptcha-site-key="recaptchaSiteKey"
      :lang="lang"
      as-card
      @submit="$emit('submit', { step: 2 })"
      @subscribe="$emit('subscribe', $event)"
      @focus="$emit('focus', { step: 2 })"
      @load="$emit('load', { step: 2 })"
      @error="$emit('error', { step: 2, error: $event })"
    />
  </div>
</template>

<script>
import Step1 from './inline-newsletter-form/step1.vue';
import Step2 from './newsletter-signup-form/step2.vue';

export default {
  components: {
    Step1,
    Step2,
  },

  props: {
    siteName: {
      type: String,
      required: true,
    },
    recaptchaSiteKey: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    defaultNewsletter: {
      type: Object,
      required: true,
      validate: o => (o && o.name && o.deploymentTypeId),
    },
    newsletters: {
      type: Array,
      default: () => [],
    },
    demographic: {
      type: Object,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    imageSrc: {
      type: String,
      default: null,
    },
    imageSrcset: {
      type: String,
      default: null,
    },
    privacyPolicyLink: {
      type: Object,
      required: true,
    },
    lang: {
      type: String,
      default: 'en',
    },
  },

  data: () => ({
    didView: false,
    email: null,
    step: 1,
  }),

  watch: {
    didView(value) {
      if (value) this.$emit('view', { step: 1 });
    },
  },

  mounted() {
    this.$emit('load', { step: 1 });
    this.$refs.lazyload.addEventListener('lazybeforeunveil', () => {
      this.didView = true;
    });
  },

  methods: {
    stepOneSubmit({ email, encryptedCustomerId }) {
      this.$emit('submit', { step: 1 });
      this.email = email;
      this.step = 2;
      if (window.olytics) window.olytics.confirm(encryptedCustomerId);
    },
  },
};
</script>
