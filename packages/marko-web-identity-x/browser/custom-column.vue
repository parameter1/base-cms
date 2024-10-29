<template>
  <div :class="colClasses">
    <!-- @todo compute and dynamic render this if the props are the same? -->
    <given-name
      v-if="fieldKey === 'givenName'"
      v-model="user.givenName"
      :class-name="className"
      :required="required"
      :label="label"
    />
    <family-name
      v-else-if="fieldKey === 'familyName'"
      v-model="user.familyName"
      :class-name="className"
      :required="required"
      :label="label"
    />
    <div v-else-if="fieldKey === 'email'">
      <form-label :for="fieldKey" :required="required">
        {{ label }}
      </form-label>
      <div class="form-group">
        <div class="input-group">
          <input disabled :value="user.email" class="form-control">
          <div v-if="enableChangeEmail" class="input-group-append">
            <a
              :href="endpoints.changeEmail"
              class="btn btn-outline-secondary d-flex justify-content-center flex-column"
              title="Change your login email address"
            >
              Change
            </a>
          </div>
        </div>
      </div>
    </div>
    <organization
      v-else-if="fieldKey === 'organization'"
      v-model="user.organization"
      :class-name="className"
      :required="required"
      :label="label"
    />
    <organization-title
      v-else-if="fieldKey === 'organizationTitle'"
      v-model="user.organizationTitle"
      :class-name="className"
      :required="required"
      :label="label"
    />
    <phone-number
      v-else-if="fieldKey === 'phoneNumber'"
      v-model="user.phoneNumber"
      :class-name="className"
      :required="required"
      :label="label"
    />
    <phone-number
      v-else-if="fieldKey === 'mobileNumber'"
      v-model="user.mobileNumber"
      :class-name="className"
      :required="required"
      :label="label"
    />
    <country-code
      v-else-if="fieldKey === 'countryCode'"
      v-model="user.countryCode"
      :class-name="className"
      :required="required"
      :label="label"
    />
    <street
      v-else-if="fieldKey === 'street'"
      v-model="user.street"
      :class-name="className"
      :required="required"
      :label="label"
    />
    <address-extra
      v-else-if="fieldKey === 'addressExtra'"
      v-model="user.addressExtra"
      :class-name="className"
      :required="required"
      :label="label"
    />
    <city
      v-else-if="fieldKey === 'city'"
      v-model="user.city"
      :class-name="className"
      :required="required"
      :label="label"
    />
    <template v-else-if="fieldKey === 'regionCode'">
      <region-code
        v-if="showCountryCodeFields"
        v-model="user.regionCode"
        :country-code="user.countryCode"
        :class-name="className"
        :required="required"
        :label="label"
      />
    </template>
    <template v-else-if="fieldKey === 'postalCode'">
      <postal-code
        v-if="showCountryCodeFields"
        v-model="user.postalCode"
        :class-name="className"
        :required="required"
        :label="label"
      />
    </template>
    <custom-select
      v-else-if="type === 'custom-select' && customField"
      :id="fieldId"
      :label="label"
      :required="required"
      :multiple="customField.field.multiple"
      :selected="customField.answers"
      :options="customField.field.options"
      @change="onCustomSelectChange(customField.answers, $event)"
    />
    <custom-boolean
      v-else-if="type === 'custom-boolean' && customField"
      :id="fieldId"
      :label="label"
      :message="label"
      :required="required"
      :value="customField.answer"
      @input="onCustomBooleanChange(customField.id, $event)"
    />
    <pre v-else>
      label: {{ label }}
      key: {{ fieldKey }}
      id: {{ fieldId }}
      type: {{ type }}
      required: {{ required }}
      width: {{ width }}
    </pre>
  </div>
</template>

<script>
import regionCountryCodes from './utils/region-country-codes';
import AddressExtra from './form/fields/address-extra.vue';
import City from './form/fields/city.vue';
import CountryCode from './form/fields/country.vue';
import CustomBoolean from './form/fields/custom-boolean.vue';
import CustomSelect from './form/fields/custom-select.vue';
import FamilyName from './form/fields/family-name.vue';
import FormLabel from './form/common/form-label.vue';
import GivenName from './form/fields/given-name.vue';
import Organization from './form/fields/organization.vue';
import OrganizationTitle from './form/fields/organization-title.vue';
import PhoneNumber from './form/fields/phone-number.vue';
import PostalCode from './form/fields/postal-code.vue';
import RegionCode from './form/fields/region.vue';
import Street from './form/fields/street.vue';

export default {
  /**
   *
   */
  components: {
    AddressExtra,
    City,
    CountryCode,
    CustomSelect,
    CustomBoolean,
    FamilyName,
    FormLabel,
    GivenName,
    Organization,
    OrganizationTitle,
    PhoneNumber,
    PostalCode,
    RegionCode,
    Street,
  },
  /**
   *
   */
  props: {
    label: {
      type: String,
      required: true,
    },
    fieldKey: {
      type: String,
      default: null,
    },
    fieldId: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      required: true,
      validator(value) {
        return ['built-in', 'custom-select', 'custom-boolean'].includes(value);
      },
    },
    required: {
      type: Boolean,
      default: false,
    },
    width: {
      type: Number,
      default: 1,
      validator(value) {
        return [0.25, 0.33, 0.5, 0.66, 1].includes(value);
      },
    },
    user: {
      type: Object,
      required: true,
    },
    endpoints: {
      type: Object,
      required: true,
    },
    enableChangeEmail: {
      type: Boolean,
      default: false,
    },
    className: {
      type: String,
      default: '',
    },
  },
  /**
   *
   */
  computed: {
    countryCode() {
      return this.user.countryCode;
    },
    /**
     *
     */
    showCountryCodeFields() {
      return regionCountryCodes.includes(this.user.countryCode);
    },

    /**
     *
     */
    customField() {
      const { fieldId, user, type } = this;
      const key = type === 'custom-select' ? 'customSelectFieldAnswers' : 'customBooleanFieldAnswers';
      const found = user[key].find((ans) => ans.id === fieldId);
      return found;
    },
    /**
     *
     */
    colClasses() {
      const classes = ['col'];
      switch (this.width) {
        case 0.25:
          classes.push('col-md-3');
          break;
        case 0.33:
          classes.push('col-md-4');
          break;
        case 0.5:
          classes.push('col-md-6');
          break;
        case 0.66:
          classes.push('col-md-8');
          break;
        default:
          break;
      }
      return classes;
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

    /**
     *
     */
    onCustomSelectChange(answers, $event) {
      const ids = Array.isArray($event) ? [...$event] : [...($event ? [$event] : [])];
      answers.splice(0);
      if (ids.length) answers.push(...ids.map((id) => ({ id })));
    },
  },
};
</script>
