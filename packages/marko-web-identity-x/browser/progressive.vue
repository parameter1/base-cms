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
              :required="givenNameSettings.required"
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
              :required="familyNameSettings.required"
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
              :required="organizationSettings.required"
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
              :required="organizationTitleSettings.required"
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
              :required="phoneNumberSettings.required"
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
              :required="countryCodeSettings.required"
              :label="defaultFieldLabels.country"
            />
          </div>
        </div>

        <address-block
          v-if="showAddressBlock"
          :user="user"
          :street="streetSettings"
          :address-extra="addressExtraSettings"
          :city="citySettings"
          :region-code="regionCodeSettings"
          :postal-code="postalCodeSettings"
          :default-field-labels="defaultFieldLabels"
        />

        <div v-if="customSelectFieldAnswers.length" class="row">
          <custom-select
            v-for="fieldAnswer in customSelectFieldAnswers"
            :id="fieldAnswer.field.id"
            :key="fieldAnswer.id"
            class="col-12"
            :class="{ 'col-md-6': (customSelectFieldAnswers.length > 1) }"
            :label="fieldAnswer.field.label"
            :required="customSelectIsRequired(fieldAnswer)"
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
              :required="fieldAnswer.field.required"
              :value="fieldAnswer.answer"
              @input="onCustomBooleanChange(fieldAnswer.id)"
            />
          </div>
        </div>

        <!-- <form-consent
          :user="user"
          :consent-policy="consentPolicy"
          :consent-policy-enabled="consentPolicyEnabled"
          :email-consent-request="emailConsentRequest"
          :email-consent-request-enabled="emailConsentRequestEnabled"
          :regional-consent-policies="regionalConsentPolicies"
          :country-code="countryCode"
        /> -->

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
            <button class="" type="button" @click="handleReload()">
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
      :required-create-fields="requiredCreateFields"
      :default-field-labels="defaultFieldLabels"
    />
  </div>
</template>

<script>
import post from './utils/post';
import cookiesEnabled from './utils/cookies-enabled';
import regionCountryCodes from './utils/region-country-codes';

import AddressBlock from './form/address-block.vue';
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
    AddressBlock,
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
      console.warn('currentProgressiceIds: ', ids);
      const unAnsweredIds = ids.filter((id) => {
        if (this.activeUser[id]) return false;
        if (this.activeUser.customBooleanFieldAnswers && this.activeUser.customBooleanFieldAnswers
          .filter(({ id: answerId, hasAnswered }) => {
            console.warn('filter: ', id, answerId, hasAnswered);
            if (id === answerId && !hasAnswered) return true;
            return false;
          }).length) return true;
        if (this.activeUser.customSelectFieldAnswers && this.activeUser.customSelectFieldAnswers
          .filter(({ id: answerId, hasAnswered }) => {
            if (id === answerId && !hasAnswered) return true;
            return false;
          }).length) return true;
        return true;
      });
      // console.warn('hittingCurrentPro: ', ids, this.user);
      return [unAnsweredIds[0]];
    },

    /**
     *
     */
    requiredFields() {
      return [...this.currentProgressiveQuestions];
    },

    /**
     *
     */
    countryCode() {
      const { user } = this;
      if (!user) return null;
      return user.countryCode;
    },

    /**
     *
     */
    customBooleanFieldAnswers() {
      const { requiredFields: ids } = this;
      const { customBooleanFieldAnswers } = this.user;
      const answers = isArray(customBooleanFieldAnswers) ? customBooleanFieldAnswers : [];
      return answers.filter(ids.length > 0 ? ({ field }) => ids.includes(field.id) : () => true)
        .sort(this.sortByActiveCustomFieldId);
    },

    /**
     *
     */
    customSelectFieldAnswers() {
      const { requiredFields: ids } = this;
      console.log('customblah: ', ids)
      const { customSelectFieldAnswers } = this.user;
      const answers = isArray(customSelectFieldAnswers) ? customSelectFieldAnswers : [];
      return answers.filter(ids.length > 0 ? ({ field }) => ids.includes(field.id) : () => true)
        .sort(this.sortByActiveCustomFieldIds);
    },

    showAddressBlock() {
      // Don't show at all until country is selected.
      if (!this.countryCode) return false;

      // Only show if a subfield is visible
      if (this.citySettings.visible) return true;
      if (this.streetSettings.visible) return true;
      if (this.regionCodeSettings.visible) return true;
      if (this.postalCodeSettings.visible) return true;
      return false;
    },

    /**
     * Field settings
     */
    givenNameSettings() {
      return {
        required: this.requiredFields.includes('givenName'),
        visible: !this.hiddenFields.includes('givenName') && this.currentProgressiveQuestions.includes('givenName'),
      };
    },
    familyNameSettings() {
      return {
        required: this.requiredFields.includes('familyName'),
        visible: !this.hiddenFields.includes('familyName') && this.currentProgressiveQuestions.includes('familyName'),
      };
    },
    organizationSettings() {
      return {
        required: this.requiredFields.includes('organization'),
        visible: !this.hiddenFields.includes('organization') && this.currentProgressiveQuestions.includes('organization'),
      };
    },
    organizationTitleSettings() {
      return {
        required: this.requiredFields.includes('organizationTitle'),
        visible: !this.hiddenFields.includes('organizationTitle') && this.currentProgressiveQuestions.includes('organizationTitle'),
      };
    },
    countryCodeSettings() {
      return {
        required: this.requiredFields.includes('countryCode'),
        visible: !this.hiddenFields.includes('countryCode') && this.currentProgressiveQuestions.includes('countryCode'),
      };
    },
    streetSettings() {
      return {
        required: this.requiredFields.includes('street'),
        visible: !this.hiddenFields.includes('street') && this.currentProgressiveQuestions.includes('street'),
      };
    },
    addressExtraSettings() {
      return {
        required: this.requiredFields.includes('addressExtra'),
        visible: !this.hiddenFields.includes('addressExtra') && this.currentProgressiveQuestions.includes('addressExtra'),
      };
    },
    phoneNumberSettings() {
      return {
        required: this.requiredFields.includes('phoneNumber'),
        visible: !this.hiddenFields.includes('phoneNumber') && this.currentProgressiveQuestions.includes('phoneNumber'),
      };
    },
    citySettings() {
      return {
        required: this.requiredFields.includes('city'),
        visible: !this.hiddenFields.includes('city') && this.currentProgressiveQuestions.includes('city'),
      };
    },
    regionCodeSettings() {
      const canRequire = regionCountryCodes.includes(this.countryCode);
      return {
        required: canRequire && this.requiredFields.includes('regionCode'),
        visible: canRequire && !this.hiddenFields.includes('regionCode') && this.currentProgressiveQuestions.includes('regionCode'),
      };
    },
    postalCodeSettings() {
      const canRequire = regionCountryCodes.includes(this.countryCode);
      return {
        required: canRequire && this.requiredFields.includes('postalCode'),
        visible: canRequire && !this.hiddenFields.includes('postalCode') && this.currentProgressiveQuestions.includes('postalCode'),
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

    sortByActiveCustomFieldIds(a, b) {
      const { activeCustomFieldIds: ids } = this;
      const sortingArr = ids.length > 0 ? ids : [];
      return sortingArr.indexOf(a.field.id) - sortingArr.indexOf(b.field.id);
    },

    async handleReload() {
      this.isReloadingPage = true;
      window.location.reload(true);
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
