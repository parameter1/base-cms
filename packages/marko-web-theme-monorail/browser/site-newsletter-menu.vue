<template>
  <aside :class="classNames">
    <div :class="element('container')">
      <step-1
        v-if="step === 1"
        :newsletter="defaultNewsletter"
        :block-name="blockName"
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
        in-pushdown
        @submit="$emit('submit', { step: 2 })"
        @subscribe="$emit('subscribe', $event)"
        @focus="$emit('focus', { step: 2 })"
        @load="$emit('load', { step: 2 })"
        @error="$emit('error', { step: 2, error: $event })"
      />
    </div>
  </aside>
</template>

<script>
import Step1 from './site-newsletter-menu/step1.vue';
import Step2 from './newsletter-signup-form/step2.vue';

export default {
  inject: ['EventBus'],
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
    initiallyExpanded: {
      type: Boolean,
      default: false,
    },
    lang: {
      type: String,
      default: 'en',
    },
  },

  data: () => ({
    blockName: 'site-newsletter-menu',
    didLoad: false,
    email: null,
    expanded: undefined,
    step: 1,
  }),

  computed: {
    currentlyExpanded() {
      if (this.expanded != null) return this.expanded;
      return this.initiallyExpanded;
    },

    classNames() {
      const { blockName } = this;
      const classes = [blockName];
      if (this.currentlyExpanded) classes.push(`${blockName}--open`);
      return classes;
    },
  },

  watch: {
    didLoad(value) {
      if (value) this.$emit('load', { step: 1 });
    },
  },

  mounted() {
    if (this.initiallyExpanded) this.didLoad = true;
    this.EventBus.$on('newsletter-menu-expanded', (expanded) => {
      this.expanded = expanded;
      if (expanded) this.didLoad = true;
    });
  },

  methods: {
    element(elementName) {
      return `${this.blockName}__${elementName}`;
    },

    stepOneSubmit({ email, encryptedCustomerId }) {
      this.$emit('submit', { step: 1 });
      this.email = email;
      this.step = 2;
      if (window.olytics) window.olytics.confirm(encryptedCustomerId);
    },
  },
};
</script>
