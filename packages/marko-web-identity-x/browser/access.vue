<template>
  <div id="access-idx-form" class="content-page-gate p-block">
    <template v-if="hasActiveUser">
      <h5 class="content-page-gate__title">
        {{ title }}
      </h5>
      <p v-if="!didSubmit" v-html="callToAction" />
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
            :user="user"
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
          <p class="success-message__title">
            Your responses have been saved, and this page will automatically reload.
          </p>
          <p class="success-message__title d-flex justify-content-between">
            If not, click the reload button
            <a
              class="btn btn-primary mr-3"
              :href="handleReload()"
            >Reload</a>
          </p>
        </div>
      </template>
    </template>

    <div v-else>
      <p v-html="callToActionLoggedOut" />
      <login
        :additional-event-data="additionalEventData"
        :source="loginSource"
        :endpoints="endpoints"
        :redirect="redirect"
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
// import DownloadRelated from './download-related.vue';

export default {
  components: {
    CustomColumn,
    // DownloadRelated,
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
      default: 'Complete the form to access this content',
    },
    callToAction: {
      type: String,
      default: 'To access this content, please fill out the form below.',
    },
    callToActionLoggedOut: {
      type: String,
      default: 'To access this content, please enter your email address below.',
    },

    /**
     * profile/login props
     */
    loginSource: {
      type: String,
      default: 'contentAccess',
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
    cookie: {
      type: Object,
      required: true,
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
      default: 'Submit & Access',
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
    updateProfileOnSubmit: {
      type: Boolean,
      default: true,
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
    redirect() {
      if (this.content.siteContext && this.content.siteContext.url) {
        return this.content.siteContext.url;
      }
      if (this.content) {
        return this.content.id;
      }
      return '/';
    },

    /**
     *
     */
    canUpdateProfile() {
      return this.hasActiveUser && this.updateProfileOnSubmit;
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
      this.emit('access-mounted');
    } else {
      const error = new FeatureError('Your browser does not support cookies. Please enable cookies to use this feature.');
      this.error = error.message;
      this.emit('access-errored', { message: error.message });
    }
  },

  /**
   *
   */
  methods: {
    async handleReload() {
      this.isReloadingPage = true;
      window.location.reload(true);
    },

    /**
     *
     */
    async handleSubmit({ withReload = true }) {
      this.error = null;
      this.isLoading = true;
      this.didSubmit = false;
      try {
        const additionalEventData = { ...this.additionalEventData, actionSource: this.loginSource };
        let data = {};
        if (this.canUpdateProfile) {
          const res = await post('/profile', { ...this.user, additionalEventData });
          data = await res.json();
          if (!res.ok) throw new FormError(data.message, res.status);
          this.user = data.user;
        }

        // Perform and notify about the download
        const eventData = { ...additionalEventData, ...(data.additionalEventData || {}) };
        await this.access(this.content, eventData);

        this.didSubmit = true;

        if (withReload) {
          this.handleReload();
        }
      } catch (e) {
        this.error = e;
        this.emit('access-errored', { message: e.message });
      } finally {
        this.isLoading = false;
      }
    },
    /**
     *
     */
    async access(content, additionalEventData) {
      try {
        const res = await post('/access', {
          contentId: content.id,
          contentType: content.type,
          cookie: this.cookie,
          // companyId: company.id,
          userId: this.user.id,
          additionalEventData,
          // Flatten the payload for storage
          payload: this.fieldRows.reduce((objs, row) => {
            const { fields, selects, booleans } = objs;
            row.forEach((col) => {
              const { id, type, label } = col;
              if (type === 'custom-select') {
                const value = this.user.customSelectFieldAnswers.find((ans) => ans.id === id);
                const values = (value.answers || []).map((answer) => {
                  const opts = value.field.options.reduce((arr, opt) => ([
                    ...arr, opt, ...(opt.options ? opt.options : []),
                  ]), []);
                  const ans = opts.find((opt) => opt.id === answer.id);
                  return { id: answer.id, label: ans.label, writeIn: answer.writeInValue };
                });
                selects[id] = { label, values };
              } else if (type === 'custom-boolean') {
                const value = this.user.customBooleanFieldAnswers.find((ans) => ans.id === id);
                booleans[id] = { label, value };
              } else {
                const value = this.user[col.key];
                fields[col.key] = { label, value };
              }
            });
            return { fields, selects, booleans };
          }, { fields: {}, selects: {}, booleans: {} }),
        });
        const data = await res.json();
        if (!res.ok) throw new FormError(data.message, res.status);

        this.emit('access-submitted', {
          contentId: content.id,
          contentType: content.type,
          userId: this.user.id,
          additionalEventData,
        }, data.entity);
      } catch (e) {
        this.error = e;
        this.emit('access-errored', { message: e.message });
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>
