<template>
  <div class="newsletter-form">
    <div ref="lazyload" class="lazyload" />
    <div :class="bem()">
      <div v-if="imageSrc" :class="bem('left-col')">
        <img :src="imageSrc" :srcset="imageSrcset" :alt="name">
      </div>
      <div :class="bem('right-col')">
        <div v-if="!submitted" :class="bem('name')">
          {{ name }}
        </div>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-if="!submitted" :class="bem('description')" v-html="description" />
        <div :class="bem('form-wrapper')">
          <login-form
            :additional-event-data="{ forceProfileReVerification: true }"
            :source="source"
            :active-user="activeUser"
            :endpoints="endpoints"
            :button-labels="buttonLabels"
            :redirect="redirect"
            :login-email-placeholder="loginEmailPlaceholder"
            :consent-policy="consentPolicy"
            :regional-consent-policies="regionalConsentPolicies"
            :app-context-id="appContextId"
            success-message-type="newsletter-signup"
            @login-link-sent="handleLoginLinkSent"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LoginForm from '@parameter1/base-cms-marko-web-identity-x/browser/login.vue';

export default {
  inject: ['EventBus'],
  components: {
    LoginForm,
  },

  props: {
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
      validator: v => v.every(val => ['large', 'footer'].includes(val)),
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
    lang: {
      type: String,
      default: 'en',
    },
    // LOGIN FORM PROPS
    source: {
      type: String,
      default: 'login',
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
    /**
     * Regional consent polices to display (if/when a user selects a country on login)
     * if enabled.
     */
    regionalConsentPolicies: {
      type: Array,
      default: () => [],
    },
  },

  data: () => ({
    blockName: 'newsletter-signup-banner',
    didView: false,
    email: null,
    step: 1,
    submitted: false,
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
    bem(name) {
      const target = name ? `${this.blockName}__${name}` : this.blockName;
      const classes = [target];
      this.modifiers.forEach(m => classes.push(`${target}--${m}`));
      return classes;
    },
    handleLoginLinkSent() {
      this.submitted = true;
    },
  },
};
</script>
