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
      :event-label="eventLabel"
      :endpoints="endpoints"
      :active-user="activeUser"
      :required-server-fields="requiredServerFields"
      :required-client-fields="requiredClientFields"
      :hidden-fields="hiddenFields"
      :default-country-code="defaultCountryCode"
      :consent-policy="consentPolicy"
      :email-consent-request="emailConsentRequest"
      :regional-consent-policies="regionalConsentPolicies"
      :button-label="buttonLabel"
      :call-to-action="callToAction"
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
import EventEmitter from './mixins/global-event-emitter';

const isEmpty = v => v == null || v === '';

export default {
  /**
   *
   */
  components: { ProfileForm },

  /**
   *
   */
  mixins: [EventEmitter],

  /**
   *
   */
  props: {
    eventLabel: {
      type: String,
      default: 'authenticate',
    },
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
    consentPolicy: {
      type: String,
      default: null,
    },
    emailConsentRequest: {
      type: String,
      default: null,
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
  },

  /**
   *
   */
  data: () => ({
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
        const { token } = this;
        if (!token) throw new Error('No login token was provided.');

        const res = await post('/authenticate', { token });
        const data = await res.json();

        if (!res.ok) throw new AuthenticationError(data.message, res.status);

        this.activeUser = data.user;
        this.mustReVerifyProfile = data.user.mustReVerifyProfile;
        this.isProfileComplete = this.requiredFields.every(key => !isEmpty(this.activeUser[key]));
        this.requiresCustomFieldAnswers = this.activeUser.customSelectFieldAnswers
          .some(({ hasAnswered, field }) => field.required && !hasAnswered);

        this.emit('authenticated', {
          mustReVerifyProfile: this.mustReVerifyProfile,
          isProfileComplete: this.isProfileComplete,
          requiresCustomFieldAnswers: this.requiresCustomFieldAnswers,
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
