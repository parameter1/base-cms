<template>
  <div v-if="hasActiveUser">
    <p>{{ callToAction }}</p>
    <form @submit.prevent="handleSubmit">
      <fieldset :disabled="isLoading">
        <div class="row">
          <div class="col-md-6">
            <given-name
              v-model="user.givenName"
              :required="givenNameSettings.required"
            />
          </div>
          <div class="col-md-6">
            <family-name
              v-model="user.familyName"
              :required="familyNameSettings.required"
            />
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <organization
              v-model="user.organization"
              :required="organizationSettings.required"
            />
          </div>
          <div class="col-md-6">
            <organization-title
              v-model="user.organizationTitle"
              :required="organizationTitleSettings.required"
            />
          </div>
        </div>

        <div class="row">
          <phone-number
            v-if="phoneNumberSettings.visible"
            v-model="user.phoneNumber"
            :required="phoneNumberSettings.required"
          />
          <div class="col-md-6">
            <country
              v-model="user.countryCode"
              :required="countryCodeSettings.required"
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
        />

        <div v-if="customSelectFieldAnswers.length" class="row">
          <custom-select
            v-for="fieldAnswer in customSelectFieldAnswers"
            :id="fieldAnswer.field.id"
            :key="fieldAnswer.id"
            class="col-md-6"
            :label="fieldAnswer.field.label"
            :required="fieldAnswer.field.required"
            :multiple="fieldAnswer.field.multiple"
            :selected="fieldAnswer.answers"
            :options="fieldAnswer.field.options"
            @change="onCustomSelectChange(fieldAnswer.answers, $event)"
          />
        </div>

        <div v-if="customBooleanFieldAnswers.length" class="row">
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

        <div v-if="emailConsentRequest" class="row mt-3">
          <div class="col-md-6">
            <receive-email
              v-model="user.receiveEmail"
              :email-consent-request="emailConsentRequest"
            />
          </div>
        </div>

        <div v-if="regionalPolicyFields.length" class="row mt-3">
          <div class="col-12">
            <regional-policy
              v-for="policy in regionalPolicyFields"
              :id="policy.id"
              :key="policy.id"
              :message="policy.message"
              :required="policy.required"
              :value="getRegionalPolicyAnswerValue(policy.id)"
              @input="setPolicyAnswer(policy.id, $event)"
            />
          </div>
        </div>

        <small
          v-if="consentPolicy"
          class="text-muted mb-3"
          v-html="consentPolicy"
        />

        <div class="d-flex align-items-center">
          <button type="submit" class="btn btn-primary">
            Submit
          </button>
          <span v-if="didSubmit" class="ml-2">
            {{ submitMessage }}
          </span>
        </div>
      </fieldset>
      <p v-if="error" class="mt-3 text-danger">
        An error occurred: {{ error }}
      </p>
    </form>
  </div>
  <div v-else>
    <p>You must be logged-in to modify your user profile.</p>
    <login
      :endpoints="endpoints"
      :app-context-id="appContextId"
      :consent-policy="consentPolicy"
      :regional-consent-policies="regionalConsentPolicies"
      :required-fields="requiredLoginFields"
    />
  </div>
</template>

<script>
import post from './utils/post';
import cookiesEnabled from './utils/cookies-enabled';
import regionCountryCodes from './utils/region-country-codes';

import AddressBlock from './form/address-block.vue';
import CustomBoolean from './form/fields/custom-boolean.vue';
import CustomSelect from './form/fields/custom-select.vue';
import GivenName from './form/fields/given-name.vue';
import FamilyName from './form/fields/family-name.vue';
import Organization from './form/fields/organization.vue';
import OrganizationTitle from './form/fields/organization-title.vue';
import Country from './form/fields/country.vue';
import PhoneNumber from './form/fields/phone-number.vue';
import ReceiveEmail from './form/fields/receive-email.vue';
import RegionalPolicy from './form/fields/regional-policy.vue';
import Login from './login.vue';

import FeatureError from './errors/feature';
import FormError from './errors/form';

const { isArray } = Array;

export default {
  components: {
    AddressBlock,
    CustomBoolean,
    CustomSelect,
    GivenName,
    FamilyName,
    Organization,
    OrganizationTitle,
    Country,
    PhoneNumber,
    ReceiveEmail,
    RegionalPolicy,
    Login,
  },

  /**
   *
   */
  props: {
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
      default: 'To complete your profile, please fill out the required fields.',
    },
    requiredServerFields: {
      type: Array,
      default: () => [],
    },
    requiredClientFields: {
      type: Array,
      default: () => [],
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
    appContextId: {
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
    requiredLoginFields: {
      type: Array,
      default: () => [],
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
      didSubmit: false,
      user: { ...this.activeUser },
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
    requiredFields() {
      return [...this.requiredServerFields, ...this.requiredClientFields];
    },

    /**
     *
     */
    countryCode() {
      const { user } = this;
      if (!user) return null;
      return user.countryCode;
    },

    submitMessage() {
      const message = 'Profile updated.';
      if (this.isReloadingPage) return `${message} Reloading page...`;
      return message;
    },

    regionalPolicyFields() {
      const { regionalConsentPolicies, countryCode } = this;
      if (!regionalConsentPolicies.length || !countryCode) return [];
      return regionalConsentPolicies.filter((policy) => {
        const countryCodes = policy.countries.map(country => country.id);
        return countryCodes.includes(countryCode);
      });
    },

    /**
     *
     */
    customBooleanFieldAnswers() {
      const { customBooleanFieldAnswers } = this.user;
      return isArray(customBooleanFieldAnswers) ? customBooleanFieldAnswers : [];
    },

    /**
     *
     */
    customSelectFieldAnswers() {
      const { customSelectFieldAnswers } = this.user;
      return isArray(customSelectFieldAnswers) ? customSelectFieldAnswers : [];
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
        visible: !this.hiddenFields.includes('givenName'),
      };
    },
    familyNameSettings() {
      return {
        required: this.requiredFields.includes('familyName'),
        visible: !this.hiddenFields.includes('familyName'),
      };
    },
    organizationSettings() {
      return {
        required: this.requiredFields.includes('organization'),
        visible: !this.hiddenFields.includes('organization'),
      };
    },
    organizationTitleSettings() {
      return {
        required: this.requiredFields.includes('organizationTitle'),
        visible: !this.hiddenFields.includes('organizationTitle'),
      };
    },
    countryCodeSettings() {
      return {
        required: this.requiredFields.includes('countryCode'),
        visible: !this.hiddenFields.includes('countryCode'),
      };
    },
    streetSettings() {
      return {
        required: this.requiredFields.includes('street'),
        visible: !this.hiddenFields.includes('street'),
      };
    },
    addressExtraSettings() {
      return {
        required: this.requiredFields.includes('addressExtra'),
        visible: !this.hiddenFields.includes('addressExtra'),
      };
    },
    phoneNumberSettings() {
      return {
        required: this.requiredFields.includes('phoneNumber'),
        visible: !this.hiddenFields.includes('phoneNumber'),
      };
    },
    citySettings() {
      return {
        required: this.requiredFields.includes('city'),
        visible: !this.hiddenFields.includes('city'),
      };
    },
    regionCodeSettings() {
      const canRequire = regionCountryCodes.includes(this.countryCode);
      return {
        required: canRequire && this.requiredFields.includes('regionCode'),
        visible: canRequire && !this.hiddenFields.includes('regionCode'),
      };
    },
    postalCodeSettings() {
      const canRequire = regionCountryCodes.includes(this.countryCode);
      return {
        required: canRequire && this.requiredFields.includes('postalCode'),
        visible: canRequire && !this.hiddenFields.includes('postalCode'),
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
    if (!cookiesEnabled()) {
      const error = new FeatureError('Your browser does not support cookies. Please enable cookies to use this feature.');
      this.error = error.message;
    }
  },

  /**
   *
   */
  methods: {
    /**
     *
     */
    getRegionalPolicyAnswer(policyId) {
      return this.user.regionalConsentAnswers.find(a => a.id === policyId);
    },

    getRegionalPolicyAnswerValue(policyId) {
      const answer = this.getRegionalPolicyAnswer(policyId);
      if (answer) return answer.given;
      return false;
    },

    setPolicyAnswer(policyId, given) {
      const answer = this.getRegionalPolicyAnswer(policyId);
      if (answer) {
        answer.given = given;
      } else {
        this.user.regionalConsentAnswers.push({ id: policyId, given });
      }
    },

    onCustomBooleanChange(id) {
      const objIndex = this.customBooleanFieldAnswers.findIndex((obj => obj.id === id));
      const answer = !this.customBooleanFieldAnswers[objIndex].answer;
      this.customBooleanFieldAnswers[objIndex].answer = answer;

      this.user.customBooleanFieldAnswers = this.customBooleanFieldAnswers;
    },

    onCustomSelectChange(answers, ids) {
      answers.splice(0);
      answers.push(...ids.map(id => ({ id })));
    },

    /**
     *
     */
    async handleSubmit() {
      this.error = null;
      this.isLoading = true;
      this.didSubmit = false;
      try {
        const res = await post('/profile', this.user);
        const data = await res.json();
        if (!res.ok) throw new FormError(data.message, res.status);

        this.user = data.user;
        this.didSubmit = true;
        this.$emit('submit', data);

        if (this.reloadPageOnSubmit) {
          this.isReloadingPage = true;
          window.location.reload(true);
        }
      } catch (e) {
        this.error = e;
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>
