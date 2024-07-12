<template>
  <aside :class="classNames">
    <div :class="element('container')">
      <div class="row">
        <div :class="element('image-wrapper', ['d-none', 'd-md-flex', 'col-md-5', 'col-lg-4'])">
          <img
            v-if="imageSrc"
            :src="imageSrc"
            :srcset="imageSrcset"
            :alt="name"
            :class="element('image')"
            :width="imageWidth"
            :height="imageHeight"
          >
        </div>
        <div :class="element('form-wrapper', ['col-12', 'col-md-6', 'col-lg-7'])">
          <div v-if="!submitted" :class="element('name')">
            {{ name }}
          </div>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-if="!submitted" :class="element('description')" v-html="description" />
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
            :action-text="actionText"
            login-email-id="newsletter-pushdown-email"
            :login-email-label="translateEmail"
            :lang="lang"
            @login-link-sent="handleLoginLinkSent"
            @login-errored="handleError"
            @focus="$emit('focus')"
          />
        </div>
        <div :class="element('close-container', ['d-none', 'd-md-flex', 'col-md-1', 'col-lg-1'])">
          <close-button
            :class-name="element('close').join(' ')"
            target-button=".site-navbar__idx-newsletter-toggler"
            :icon-modifiers="['lg']"
          />
        </div>
      </div>
    </div>
  </aside>
</template>

<script>
import LoginForm from '@parameter1/base-cms-marko-web-identity-x/browser/login.vue';
import CloseButton from '../newsletter-close-button.vue';
import i18n from '../i18n-vue';

export default {
  components: {
    CloseButton,
    LoginForm,
  },
  inject: ['EventBus'],

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
    initiallyExpanded: {
      type: Boolean,
      default: false,
    },
    lang: {
      type: String,
      default: 'en',
    },

    actionText: {
      type: String,
      default: 'signing up to receive your email notifications',
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
      default: null,
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
    blockName: 'site-newsletter-menu',
    didLoad: false,
    email: null,
    expanded: undefined,
    submitted: false,
  }),

  computed: {
    loginAdditionalEventData() {
      return {
        ...this.additionalEventData,
        forceProfileReVerification: true,
        newsletterSignupType: 'pushdown',
      };
    },
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
    translateEmail() {
      if (this.loginEmailLabel) return this.loginEmailLabel;
      return i18n(this.lang, 'emailAddress');
    },
  },

  watch: {
    didLoad(value) {
      if (value) this.$emit('load', { step: 1 });
    },
  },

  mounted() {
    if (this.initiallyExpanded) this.didLoad = true;
    this.EventBus.$on('idx-newsletter-menu-expanded', (expanded) => {
      this.expanded = expanded;
      if (expanded) this.didLoad = true;
    });
  },

  methods: {
    element(elementName, classNames = []) {
      return [`${this.blockName}__${elementName}`, ...classNames];
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
