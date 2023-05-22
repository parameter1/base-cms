<template>
  <div id="content-download-idx-form" class="content-page-gate">
    <template v-if="hasActiveUser">
      <h5 class="content-page-gate__title">
        {{ title }}
      </h5>
      <p v-if="!didSubmit">
        {{ callToAction }}
      </p>
      <form v-if="!didSubmit" @submit.prevent="handleSubmit">
        <fieldset :disabled="isLoading">
          <div v-for="(row, ridx) in fieldRows" :key="ridx" class="row">
            <custom-column
              v-for="(col, cidx) in row"
              :key="`${ridx}_${cidx}`"
              :label="col.label || defaultFieldLabels[col.key]"
              :field-key="col.key"
              :field-id="col.id"
              :type="col.type"
              :required="col.required"
              :width="col.width || 1"
              :user="user"
              :endpoints="endpoints"
              :enable-change-email="enableChangeEmail"
            />
          </div>

          <form-consent
            :user="activeUser"
            :consent-policy="consentPolicy"
            :consent-policy-enabled="consentPolicyEnabled"
            :email-consent-request="emailConsentRequest"
            :email-consent-request-enabled="emailConsentRequestEnabled"
            :regional-consent-policies="regionalConsentPolicies"
            :country-code="countryCode"
          />

          <div class="d-flex align-items-center">
            <button type="submit" class="btn btn-primary">
              {{ buttonLabel }}
            </button>
          </div>
        </fieldset>
        <p v-if="error" class="mt-3 text-danger">
          An error occurred: {{ error }}
        </p>
      </form>

      <template v-else>
        <div class="success-message">
          <div class="success-message__title">
            <p>
              Your responses have been saved, and your download should start automatically.
            </p>
            <p>
              If not, <a :href="content.fileSrc" target="_blank">click here</a> to download.
            </p>
          </div>
        </div>
      </template>
    </template>

    <div v-else>
      <p>{{ callToActionLoggedOut }}</p>
      <login
        :additional-event-data="additionalEventData"
        :source="loginSource"
        :endpoints="endpoints"
        :app-context-id="appContextId"
        :consent-policy="consentPolicy"
        :consent-policy-enabled="consentPolicyEnabled"
        :email-consent-request="emailConsentRequest"
        :email-consent-request-enabled="emailConsentRequestEnabled"
        :regional-consent-policies="regionalConsentPolicies"
        :required-create-fields="requiredCreateFields"
        :default-field-labels="defaultFieldLabels"
      />
    </div>
  </div>
</template>

<script>
import post from './utils/post';
import cookiesEnabled from './utils/cookies-enabled';

import FormConsent from './form/consent.vue';
import CustomColumn from './custom-column.vue';
import Login from './login.vue';

import FeatureError from './errors/feature';
import FormError from './errors/form';
import EventEmitter from './mixins/global-event-emitter';

export default {
  components: {
    CustomColumn,
    FormConsent,
    Login,
  },

  /**
   *
   */
  mixins: [EventEmitter],

  /**
   *
   */
  props: {
    /**
     * custom form props
     */
    content: {
      type: Object,
      required: true,
    },
    fieldRows: {
      type: Array,
      required: true,
    },
    title: {
      type: String,
      default: 'Complete the form to download this content',
    },
    callToAction: {
      type: String,
      default: 'To download this content, please fill out the form below.',
    },
    callToActionLoggedOut: {
      type: String,
      default: 'To download this content, please enter your email address below.',
    },

    /**
     * profile/login props
     */
    loginSource: {
      type: String,
      default: 'contentDownload',
    },
    endpoints: {
      type: Object,
      required: true,
    },
    activeUser: {
      type: Object,
      default: () => ({}),
    },
    requiredCreateFields: {
      type: Array,
      default: () => [],
    },
    defaultFieldLabels: {
      type: Object,
      default: () => {},
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
    appContextId: {
      type: String,
      default: null,
    },
    buttonLabel: {
      type: String,
      default: 'Submit & Download',
    },
    regionalConsentPolicies: {
      type: Array,
      default: () => [],
    },
    defaultCountryCode: {
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
  data() {
    return {
      error: null,
      isLoading: false,
      isReloadingPage: false,
      isRedirectingPage: false,
      didSubmit: false,
      user: {
        ...this.activeUser,
        ...(this.defaultCountryCode
          && !this.activeUser.countryCode
          && { countryCode: this.defaultCountryCode }
        ),
      },
    };
  },

  /**
   *
   */
  computed: {
    /**
     *
     */
    hasActiveUser() {
      return this.user && this.user.email;
    },

    /**
     *
     */
    countryCode() {
      if (this.user && this.user.countryCode) return this.user.countryCode;
      return this.defaultCountryCode;
    },
  },

  /**
   *
   */
  mounted() {
    if (cookiesEnabled()) {
      this.emit('download-mounted');
    } else {
      const error = new FeatureError('Your browser does not support cookies. Please enable cookies to use this feature.');
      this.error = error.message;
      this.emit('download-errored', { message: error.message });
    }
  },

  /**
   *
   */
  methods: {
    /**
     *
     */
    async handleSubmit() {
      this.error = null;
      this.isLoading = true;
      this.didSubmit = false;
      try {
        const additionalEventData = { ...this.additionalEventData, actionSource: this.loginSource };
        const res = await post('/profile', { ...this.user, additionalEventData });
        const data = await res.json();
        if (!res.ok) throw new FormError(data.message, res.status);

        this.user = data.user;
        this.didSubmit = true;

        // Re-focus on the form
        document.getElementById('content-download-idx-form').scrollIntoView({ behavior: 'smooth' });

        this.emit('download-submitted', {
          content: this.content,
          user: this.user,
          additionalEventData: { ...additionalEventData, ...(data.additionalEventData || {}) },
        });

        // Attempt to open download
        window.open(this.content.fileSrc, '_blank');
      } catch (e) {
        this.error = e;
        this.emit('download-errored', { message: e.message });
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>
