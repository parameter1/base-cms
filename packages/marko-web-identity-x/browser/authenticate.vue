<template>
  <div v-if="isRedirecting">
    <p>You've successfully logged in. Redirecting you...</p>
  </div>
  <div v-else-if="isLoading">
    <p>Logging in...</p>
  </div>
  <div v-else-if="showProfileForm">
    <profile-form
      :additional-event-data="additionalEventData"
      :endpoints="endpoints"
      :active-user="activeUser"
      :required-server-fields="requiredServerFields"
      :required-client-fields="requiredClientFields"
      :active-custom-field-ids="activeCustomFieldIds"
      :hidden-fields="hiddenFields"
      :default-country-code="defaultCountryCode"
      :boolean-questions-label="booleanQuestionsLabel"
      :consent-policy="consentPolicy"
      :consent-policy-enabled="consentPolicyEnabled"
      :email-consent-request="emailConsentRequest"
      :email-consent-request-enabled="emailConsentRequestEnabled"
      :regional-consent-policies="regionalConsentPolicies"
      :button-label="buttonLabel"
      :call-to-action="callToAction"
      :default-field-labels="defaultFieldLabels"
      :enable-change-email="enableChangeEmail"
      @profile-updated="redirect"
    />
  </div>
  <div v-else-if="error" class="alert alert-danger" role="alert">
    <h5 class="alert-heading">
      Unable to Login
    </h5>
    <p>{{ error.message }}</p>
    <hr>
    <p class="mb-0">
      Please try <a :href="endpoints.login" class="alert-link">logging in</a> again.
    </p>
  </div>
</template>

<script>
import redirect from './utils/redirect';
import cookiesEnabled from './utils/cookies-enabled';
import post from './utils/post';
import ProfileForm from './profile.vue';
import AuthenticationError from './errors/authentication';
import FeatureError from './errors/feature';
import AutoSignupEventEmitter from './mixins/global-auto-signup-event-emitter';
import EventEmitter from './mixins/global-event-emitter';

const isEmpty = (v) => v == null || v === '';

export default {
  /**
   *
   */
  components: { ProfileForm },

  /**
   *
   */
  mixins: [EventEmitter, AutoSignupEventEmitter],

  /**
   *
   */
  props: {
    token: {
      type: String,
      required: true,
    },
    endpoints: {
      type: Object,
      required: true,
    },
    redirectTo: {
      type: String,
      default: '/',
    },
    hiddenFields: {
      type: Array,
      default: () => [],
    },
    requiredServerFields: {
      type: Array,
      default: () => [],
    },
    requiredClientFields: {
      type: Array,
      default: () => [],
    },
    activeCustomFieldIds: {
      type: Array,
      default: () => [],
    },
    consentPolicy: {
      type: String,
      default: null,
    },
    consentPolicyEnabled: {
      type: Boolean,
      default: false,
    },
    emailConsentRequest: {
      type: String,
      default: null,
    },
    emailConsentRequestEnabled: {
      type: Boolean,
      default: false,
    },
    regionalConsentPolicies: {
      type: Array,
      default: () => [],
    },
    callToAction: {
      type: String,
      default: null,
    },
    buttonLabel: {
      type: String,
      default: 'Submit',
    },
    defaultCountryCode: {
      type: String,
      default: null,
    },
    defaultFieldLabels: {
      type: Object,
      default: () => ({}),
    },
    booleanQuestionsLabel: {
      type: String,
      default: null,
    },
    enableChangeEmail: {
      type: Boolean,
      default: false,
    },
  },

  /**
   *
   */
  data: () => ({
    bypassProfileForm: false,
    error: null,
    isLoading: false,
    isRedirecting: false,
    isProfileComplete: true,
    activeUser: null,
    requiresCustomFieldAnswers: false,
    mustReVerifyProfile: false,
  }),

  /**
   *
   */
  computed: {
    /**
     *
     */
    requiredFields() {
      return [...this.requiredServerFields, ...this.requiredClientFields];
    },

    /**
     *
     */
    formHasRequiredFields() {
      return Boolean(this.requiredFields.length);
    },

    isUserRedirect() {
      const { redirectTo } = this;
      const { login, register } = this.endpoints;
      if (redirectTo.indexOf(login) === 0) return true;
      if (redirectTo.indexOf(register) === 0) return true;
      return false;
    },

    /**
     *
     */
    showProfileForm() {
      if (this.bypassProfileForm) return false;
      if (this.mustReVerifyProfile) return true;
      if (this.requiresCustomFieldAnswers) return true;
      return !this.isProfileComplete;
    },
  },

  /**
   *
   */
  mounted() {
    if (cookiesEnabled()) {
      this.emit('authenticate-mounted');
      this.authenticate();
    } else {
      this.error = new FeatureError('Your browser does not support cookies. Please enable cookies to use this feature.');
      this.emit('authenticate-errored', { message: this.error.message });
    }
  },

  /**
   *
   */
  methods: {
    /**
     *
     */
    async authenticate() {
      this.isLoading = true;
      try {
        const { token, additionalEventData, activeCustomFieldIds: ids } = this;
        if (!token) throw new Error('No login token was provided.');

        const res = await post('/authenticate', { token, additionalEventData });
        const data = await res.json();
        if (!res.ok) throw new AuthenticationError(data.message, res.status);

        this.activeUser = data.user;
        this.mustReVerifyProfile = data.user.mustReVerifyProfile;
        const customAnswerIds = [
          ...data.user.customBooleanFieldAnswers,
          ...data.user.customSelectFieldAnswers,
        ].filter((field) => field.hasAnswered).map((field) => field.id);

        this.isProfileComplete = this.requiredFields
          .every((key) => customAnswerIds.includes(key) || !isEmpty(this.activeUser[key]));

        this.requiresCustomFieldAnswers = this.activeUser.customSelectFieldAnswers
          .filter(!ids.length ? ({ field }) => ids.includes(field.id) : () => true)
          .some(({ hasAnswered, field }) => field.required && !hasAnswered);
        this.bypassProfileForm = data.loginSource === 'contentDownload';

        this.emitAutoSignup(data);
        this.emit('authenticated', {
          ...data,
          id: this.activeUser.id,
          email: this.activeUser.email,
          verifiedCount: this.activeUser.verifiedCount,
          mustReVerifyProfile: this.mustReVerifyProfile,
          isProfileComplete: this.isProfileComplete,
          requiresCustomFieldAnswers: this.requiresCustomFieldAnswers,
          actionSource: data.loginSource,
          additionalEventData: {
            ...(this.additionalEventData || {}),
            ...(data.additionalEventData || {}),
          },
        });

        if (!this.showProfileForm) this.redirect();
      } catch (e) {
        if (/no token was found/i.test(e.message)) {
          e.message = 'This login link has either expired or was already used.';
        }
        this.error = e;
        this.emit('authenticate-errored', { message: e.message });
      } finally {
        this.isLoading = false;
      }
    },

    /**
     *
     */
    redirect() {
      this.isRedirecting = true;
      const redirectTo = this.isUserRedirect ? '/' : this.redirectTo;
      redirect(redirectTo);
    },
  },
};
</script>
