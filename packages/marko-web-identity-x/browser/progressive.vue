<template>
  <div v-if="hasActiveUser" id="progressive-form-wrapper">
    <p v-if="!didSubmit">
      {{ callToAction }}
    </p>
    <form v-if="!didSubmit" @submit.prevent="handleSubmit">
      <fieldset :disabled="isLoading">
        <div class="row">
          <div
            v-if="givenNameSettings.visible"
            class="col-12"
            :class="{ 'col-md-6': familyNameSettings.visible }"
          >
            <given-name
              v-model="user.givenName"
              required
              :label="defaultFieldLabels.givenName"
            />
          </div>
          <div
            v-if="familyNameSettings.visible"
            class="col-12"
            :class="{ 'col-md-6': givenNameSettings.visible }"
          >
            <family-name
              v-model="user.familyName"
              required
              :label="defaultFieldLabels.familyName"
            />
          </div>
        </div>

        <div class="row">
          <div
            v-if="organizationSettings.visible"
            class="col-12"
            :class="{ 'col-md-6': organizationTitleSettings.visible }"
          >
            <organization
              v-model="user.organization"
              required
              :label="defaultFieldLabels.organization"
            />
          </div>
          <div
            v-if="organizationTitleSettings.visible"
            class="col-12"
            :class="{ 'col-md-6': organizationSettings.visible }"
          >
            <organization-title
              v-model="user.organizationTitle"
              required
              :label="defaultFieldLabels.organizationTitle"
            />
          </div>
        </div>

        <div class="row">
          <div
            v-if="phoneNumberSettings.visible"
            class="col-12"
            :class="{ 'col-md-6': countryCodeSettings.visible }"
          >
            <phone-number
              v-model="user.phoneNumber"
              required
              :label="defaultFieldLabels.phoneNumber"
            />
          </div>
          <div
            v-if="countryCodeSettings.visible"
            class="col-12"
            :class="{ 'col-md-6': phoneNumberSettings.visible }"
          >
            <country
              v-model="user.countryCode"
              required
              :label="defaultFieldLabels.country"
            />
          </div>
        </div>

        <div v-if="streetSettings.visible" class="row">
          <street
            v-model="user.street"
            required
            class="col-md-12"
            :class="{ 'col-md-6': addressExtraSettings.visible }"
            :label="defaultFieldLabels.street"
          />
          <address-extra
            v-if="addressExtraSettings.visible"
            v-model="user.addressExtra"
            required
            :label="defaultFieldLabels.addressExtra"
          />
        </div>

        <div
          v-if="citySettings.visible || regionCodeSettings.visible || postalCodeSettings.visible"
          class="row"
        >
          <city
            v-if="citySettings.visible"
            v-model="user.city"
            required
            class="col-12"
            :label="defaultFieldLabels.city"
          />
          <region
            v-if="regionCodeSettings.visible"
            v-model="user.regionCode"
            :country-code="user.countryCode"
            required
            class="col-12"
            :label="defaultFieldLabels.region"
          />
          <postal-code
            v-if="postalCodeSettings.visible"
            v-model="user.postalCode"
            required
            class="col-12"
            :label="defaultFieldLabels.postalCode"
          />
        </div>

        <div v-if="customSelectFieldAnswers.length" class="row">
          <custom-select
            v-for="fieldAnswer in customSelectFieldAnswers"
            :id="fieldAnswer.field.id"
            :key="fieldAnswer.id"
            class="col-12"
            :class="{ 'col-md-6': (customSelectFieldAnswers.length > 1) }"
            :label="fieldAnswer.field.label"
            required
            :multiple="fieldAnswer.field.multiple"
            :selected="fieldAnswer.answers"
            :options="fieldAnswer.field.options"
            @change="onCustomSelectChange(fieldAnswer.answers, $event)"
          />
        </div>

        <div v-if="customBooleanFieldAnswers.length" class="row mt-3">
          <div
            v-if="booleanQuestionsLabel"
            class="col-12 boolean-questions-label"
            v-html="booleanQuestionsLabel"
          />
          <div
            v-for="fieldAnswer in customBooleanFieldAnswers"
            :key="fieldAnswer.id"
            class="col-12"
          >
            <custom-boolean
              :id="fieldAnswer.id"
              :message="fieldAnswer.field.label"
              required
              :value="fieldAnswer.answer"
              @input="onCustomBooleanChange(fieldAnswer.id)"
            />
          </div>
        </div>

        <form-consent
          hide-when-answered
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
    <div v-else>
      <div class="success-message">
        <div class="success-message__title">
          Your profile has been update.
        </div>
        <div class="success-message__message">
          <p>
            To finsih filling out your profile,
            <button class="" type="button" href="/user/profile">
              click here
            </button>.
          </p>
          <p>
            To return to the home page, <a href="/">click here</a>.
          </p>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <p>You must be logged in to modify your user profile.</p>
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
      required
      :default-field-labels="defaultFieldLabels"
    />
  </div>
</template>

<script>
import post from './utils/post';
import cookiesEnabled from './utils/cookies-enabled';
import regionCountryCodes from './utils/region-country-codes';

import City from './form/fields/city.vue';
import Region from './form/fields/region.vue';
import PostalCode from './form/fields/postal-code.vue';
import Street from './form/fields/street.vue';
import AddressExtra from './form/fields/address-extra.vue';
import FormConsent from './form/consent.vue';
import CustomBoolean from './form/fields/custom-boolean.vue';
import CustomSelect from './form/fields/custom-select.vue';
import GivenName from './form/fields/given-name.vue';
import FamilyName from './form/fields/family-name.vue';
import Organization from './form/fields/organization.vue';
import OrganizationTitle from './form/fields/organization-title.vue';
import Country from './form/fields/country.vue';
import PhoneNumber from './form/fields/phone-number.vue';
import Login from './login.vue';

import FeatureError from './errors/feature';
import FormError from './errors/form';
import AutoSignupEventEmitter from './mixins/global-auto-signup-event-emitter';
import EventEmitter from './mixins/global-event-emitter';

const { isArray } = Array;

export default {
  components: {
    City,
    Region,
    PostalCode,
    Street,
    AddressExtra,
    CustomBoolean,
    CustomSelect,
    GivenName,
    FamilyName,
    FormConsent,
    Organization,
    OrganizationTitle,
    Country,
    PhoneNumber,
    Login,
  },

  /**
   *
   */
  mixins: [EventEmitter, AutoSignupEventEmitter],

  /**
   *
   */
  props: {
    loginSource: {
      type: String,
      default: 'default',
    },
    endpoints: {
      type: Object,
      required: true,
    },
    activeUser: {
      type: Object,
      default: () => ({}),
    },
    callToAction: {
      type: String,
      default: 'Please tell us a little more about yourself',
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
    progressiveFields: {
      type: Array,
      default: () => [],
    },
    requiredCreateFields: {
      type: Array,
      default: () => [],
    },
    defaultFieldLabels: {
      type: Object,
      default: () => {},
    },
    hiddenFields: {
      type: Array,
      default: () => [],
    },
    reloadPageOnSubmit: {
      type: Boolean,
      default: false,
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
      default: 'Submit',
    },
    regionalConsentPolicies: {
      type: Array,
      default: () => [],
    },
    requiredLoginFields: {
      type: Array,
      default: () => [],
    },
    defaultCountryCode: {
      type: String,
      default: null,
    },
    booleanQuestionsLabel: {
      type: String,
      default: null,
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
        ...(
          !this.hiddenFields.includes('countryCode')
          && this.defaultCountryCode
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
    currentProgressiveQuestions() {
      const ids = this.progressiveFields.map(({ id }) => id);
      const addressDependent = ['regionCode', 'postalCode'];
      const unAnsweredIds = ids.filter((id) => {
        // filter already preansered userFields
        if (this.activeUser[id]) return false;
        // Region & Postal are dependent on country being United Stages, Canada or Mexico
        if (addressDependent.includes(id)) {
          if (!this.countryCode || !regionCountryCodes.includes(this.countryCode)) return false;
          return true;
        }
        // only return non answered customBooleanFields
        const { customBooleanFieldAnswers, customSelectFieldAnswers} = this.activeUser;
        const filteredBoolean = customBooleanFieldAnswers && customBooleanFieldAnswers
          .filter(({ id: answerId }) => id === answerId);
        if (filteredBoolean.length !== 0) {
          return filteredBoolean.some(({ hasAnswered }) => !hasAnswered);
        }
        const filteredSelect = customSelectFieldAnswers && customSelectFieldAnswers
          .filter(({ id: answerId }) => id === answerId);
        if (filteredSelect.length !== 0) {
          return filteredSelect.some(({ hasAnswered }) => !hasAnswered);
        }
        // only return non answered customSelectFields
        return true;
      });
      // for now ensure only one is returned.
      return unAnsweredIds;
    },

    /**
     *
     */
    requiredFields() {
      // for now ensure only one is returned.
      const requiredIds = [this.currentProgressiveQuestions[0]];
      // [...this.currentProgressiveQuestions[0]];
      return requiredIds;
    },

    /**
     *
     */
    countryCode() {
      const { activeUser } = this;
      if (!activeUser) return null;
      return activeUser.countryCode;
    },

    /**
     *
     */
    customBooleanFieldAnswers() {
      const { requiredFields: ids } = this;
      const { customBooleanFieldAnswers } = this.user;
      const answers = isArray(customBooleanFieldAnswers) ? customBooleanFieldAnswers : [];
      return answers.filter(ids.length > 0 ? ({ field }) => ids.includes(field.id) : () => true);
    },

    /**
     *
     */
    customSelectFieldAnswers() {
      const { requiredFields: ids } = this;
      const { customSelectFieldAnswers } = this.user;
      const answers = isArray(customSelectFieldAnswers) ? customSelectFieldAnswers : [];
      return answers.filter(ids.length > 0 ? ({ field }) => ids.includes(field.id) : () => true);
    },

    /**
     * Field settings
     */
    givenNameSettings() {
      return {
        visible: this.requiredFields.includes('givenName'),
      };
    },
    familyNameSettings() {
      return {
        visible: this.requiredFields.includes('familyName'),
      };
    },
    organizationSettings() {
      return {
        visible: this.requiredFields.includes('organization'),
      };
    },
    organizationTitleSettings() {
      return {
        visible: this.requiredFields.includes('organizationTitle'),
      };
    },
    countryCodeSettings() {
      return {
        visible: this.requiredFields.includes('countryCode'),
      };
    },
    streetSettings() {
      return {
        visible: this.requiredFields.includes('street'),
      };
    },
    addressExtraSettings() {
      return {
        visible: this.requiredFields.includes('addressExtra'),
      };
    },
    phoneNumberSettings() {
      return {
        visible: this.requiredFields.includes('phoneNumber'),
      };
    },
    citySettings() {
      return {
        visible: this.requiredFields.includes('city'),
      };
    },
    regionCodeSettings() {
      const canRequire = regionCountryCodes.includes(this.countryCode);
      return {
        visible: canRequire && this.requiredFields.includes('regionCode'),
      };
    },
    postalCodeSettings() {
      const canRequire = regionCountryCodes.includes(this.countryCode);
      return {
        visible: canRequire && this.requiredFields.includes('postalCode'),
      };
    },
  },

  /**
   *
   */
  watch: {
    /**
     * Clear region and postal codes on country code change.
     */
    countryCode() {
      this.user.regionCode = null;
      this.user.postalCode = null;
    },
  },

  /**
   *
   */
  mounted() {
    if (cookiesEnabled()) {
      this.emit('progressive-mounted');
    } else {
      const error = new FeatureError('Your browser does not support cookies. Please enable cookies to use this feature.');
      this.error = error.message;
      this.emit('progressive-errored', { message: error.message });
    }
  },

  /**
   *
   */
  methods: {
    /**
     *
     */
    onCustomBooleanChange(id) {
      const objIndex = this.customBooleanFieldAnswers.findIndex(((obj) => obj.id === id));
      const answer = !this.customBooleanFieldAnswers[objIndex].answer;
      this.customBooleanFieldAnswers[objIndex].answer = answer;

      this.user.customBooleanFieldAnswers = this.customBooleanFieldAnswers;
    },

    onCustomSelectChange(answers, $event) {
      const ids = Array.isArray($event) ? [...$event] : [...($event ? [$event] : [])];
      answers.splice(0);
      if (ids.length) answers.push(...ids.map((id) => ({ id })));
    },

    customSelectIsRequired(fieldAnswer) {
      return this.requiredFields.includes(fieldAnswer.field.id) || fieldAnswer.field.required;
    },

    /**
     *
     */
    async handleSubmit() {
      this.error = null;
      this.isLoading = true;
      this.didSubmit = false;
      try {
        const res = await post('/progressive', {
          ...this.user,
          additionalEventData: {
            ...this.additionalEventData,
            actionSource: this.loginSource,
          },
        });
        const data = await res.json();
        if (!res.ok) throw new FormError(data.message, res.status);

        this.user = data.user;
        this.didSubmit = true;
        // force scroll to top of page when form and success message toggle
        window.scrollTo(0, 0);

        this.emitAutoSignup(data);
        this.emit('progressive-updated', {
          additionalEventData: {
            ...(this.additionalEventData || {}),
            ...(data.additionalEventData || {}),
          },
        });

        if (this.reloadPageOnSubmit) {
          this.isReloadingPage = true;
          window.location.reload(true);
        }
      } catch (e) {
        this.error = e;
        this.emit('progressive-errored', { message: e.message });
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>
