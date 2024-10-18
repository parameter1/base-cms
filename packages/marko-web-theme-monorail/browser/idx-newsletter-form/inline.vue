<template>
  <div class="newsletter-form">
    <div ref="lazyload" class="lazyload" />
    <div :class="bem()">
      <div v-if="imageSrc" :class="bem('left-col')">
        <img
          :src="imageSrc"
          :srcset="imageSrcset"
          :alt="name"
          :width="imageWidth"
          :height="imageHeight"
        >
      </div>
      <div :class="bem('right-col')">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-if="!submitted" :class="bem('name')" v-html="name" />
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-if="!submitted" :class="bem('description')" v-html="description" />
        <div :class="bem('form-wrapper')">
          <login-form
            :additional-event-data="loginAdditionalEventData"
            :source="source"
            :active-user="activeUser"
            :endpoints="endpoints"
            :button-labels="buttonLabels"
            :redirect="redirect"
            :login-email-placeholder="loginEmailPlaceholder"
            :consent-policy-enabled="true"
            :consent-policy="consentPolicy"
            :email-consent-request-enabled="true"
            :email-consent-request="emailConsentRequest"
            :required-create-fields="requiredCreateFields"
            :default-field-labels="defaultFieldLabels"
            :regional-consent-policies="regionalConsentPolicies"
            :app-context-id="appContextId"
            :login-email-label="translateEmail"
            :lang="lang"
            :action-text="actionText"
            success-message-type="newsletter-signup"
            @login-link-sent="handleLoginLinkSent"
            @login-errored="handleError"
            @focus="$emit('focus', { type })"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LoginForm from '@parameter1/base-cms-marko-web-identity-x/browser/login.vue';
import i18n from '../i18n-vue';

export default {
  components: {
    LoginForm,
  },
  inject: ['EventBus'],

  props: {
    type: {
      type: String,
      required: true,
      validator(value) {
        return [
          'inlineContent',
          'inlineSection',
          'footer',
          'modal',
          'recommended',
        ].includes(value);
      },
    },
    siteName: {
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
    modifiers: {
      type: Array,
      default: () => ['large'],
      validator: (v) => v.every((val) => ['large', 'footer', 'modal'].includes(val)),
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
    imageWidth: {
      type: String,
      default: '',
    },
    imageHeight: {
      type: String,
      default: '',
    },
    lang: {
      type: String,
      default: 'en',
    },
    // LOGIN FORM PROPS
    source: {
      type: String,
      default: 'newsletterSignup',
    },
    activeUser: {
      type: Object,
      default: () => {},
    },
    endpoints: {
      type: Object,
      required: true,
    },
    buttonLabels: {
      type: Object,
      default: () => ({
        continue: 'Continue',
        logout: 'Logout',
      }),
    },
    consentPolicy: {
      type: String,
      default: null,
    },
    emailConsentRequest: {
      type: String,
      default: null,
    },
    redirect: {
      type: String,
      default: null,
    },
    appContextId: {
      type: String,
      default: null,
    },
    loginEmailPlaceholder: {
      type: String,
      default: null,
    },
    senderEmailAddress: {
      type: String,
      default: 'noreply@identity-x.parameter1.com',
    },
    additionalEventData: {
      type: Object,
      default: () => ({
        forceProfileReVerification: true,
      }),
    },
    loginEmailLabel: {
      type: String,
      default: '',
    },
    /**
     * Regional consent polices to display (if/when a user selects a country on login)
     * if enabled.
     */
    regionalConsentPolicies: {
      type: Array,
      default: () => [],
    },
    actionText: {
      type: String,
      default: 'signing up to receive your email notifications',
    },
    requiredCreateFields: {
      type: Array,
      default: () => [],
    },
    defaultFieldLabels: {
      type: Object,
      default: () => ({}),
    },
  },

  data: () => ({
    blockName: 'newsletter-signup-banner',
    didView: false,
    email: null,
    step: 1,
    submitted: false,
  }),

  computed: {
    loginAdditionalEventData() {
      return {
        ...this.additionalEventData,
        forceProfileReVerification: true,
        newsletterSignupType: this.type,
      };
    },
    translateEmail() {
      if (this.loginEmailLabel) return this.loginEmailLabel;
      return i18n(this.lang, 'emailAddress');
    },
  },

  watch: {
    didView(value) {
      if (value) this.$emit('view', { step: 1 });
    },
  },

  mounted() {
    this.$emit('load', { step: 1, type: this.type });
    this.$refs.lazyload.addEventListener('lazybeforeunveil', () => {
      this.didView = true;
      this.$emit('view', { type: this.type });
    });
  },

  methods: {
    bem(name) {
      const target = name ? `${this.blockName}__${name}` : this.blockName;
      const classes = [target];
      this.modifiers.forEach((m) => classes.push(`${target}--${m}`));
      return classes;
    },
    handleLoginLinkSent() {
      this.submitted = true;
      this.$emit('submit', { type: this.type });
    },
    handleError(error) {
      this.$emit('error', { type: this.type, error });
    },
  },
};
</script>
