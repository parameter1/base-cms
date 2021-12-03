<template>
  <form v-if="incomplete" :class="formClass" @submit.prevent="onSubmit">
    <input type="hidden" name="contentId" :value="contentId">
    <input type="hidden" name="contentType" :value="contentType">
    <div class="row">
      <div class="col-md-6">
        <div class="form-group">
          <form-label id="inquiry-form.first-name" :required="true">
            {{ translate("firstNameLabel") }}
          </form-label>
          <input
            id="inquiry-form.first-name"
            v-model="firstName"
            name="firstName"
            type="text"
            class="form-control"
            required
          >
        </div>
      </div>
      <div class="col-md-6">
        <div class="form-group">
          <form-label id="inquiry-form.last-name" :required="true">
            {{ translate("surnameLabel") }}
          </form-label>
          <input
            id="inquiry-form.last-name"
            v-model="lastName"
            name="lastName"
            type="text"
            class="form-control"
            required
          >
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-6">
        <div class="form-group">
          <form-label id="inquiry-form.email" :required="true">
            {{ translate("emailLabel") }}
          </form-label>
          <input
            id="inquiry-form.email"
            v-model="email"
            name="email"
            type="email"
            class="form-control"
            required
          >
        </div>
      </div>
      <div class="col-md-6">
        <div class="form-group">
          <form-label id="inquiry-form.phone">
            {{ translate("phoneLabel") }}
          </form-label>
          <input
            id="inquiry-form.phone"
            v-model="phone"
            name="phone"
            type="text"
            class="form-control"
          >
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-6">
        <div class="form-group">
          <form-label id="inquiry-form.company">
            {{ translate("companyLabel") }}
          </form-label>
          <input
            id="inquiry-form.company"
            v-model="company"
            name="company"
            type="text"
            class="form-control"
          >
        </div>
      </div>
      <div class="col-md-6">
        <div class="form-group">
          <form-label id="inquiry-form.job-title" :required="true">
            {{ translate("jobTitleLabel") }}
          </form-label>
          <input
            id="inquiry-form.job-title"
            v-model="jobTitle"
            name="jobTitle"
            type="text"
            class="form-control"
            required
          >
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-6">
        <country-field v-model="country" :required="true" :lang="lang" />
      </div>
      <div class="col-md-6">
        <div class="form-group">
          <form-label id="inquiry-form.postal-code">
            {{ translate("zipLabel") }}
          </form-label>
          <input
            id="inquiry-form.postal-code"
            v-model="postalCode"
            name="postalCode"
            type="text"
            class="form-control"
          >
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-12">
        <div class="form-group">
          <form-label id="inquiry-form.comments">
            {{ translate("commentsLabel") }}
          </form-label>
          <textarea
            id="inquiry-form.comments"
            v-model="comments"
            name="comments"
            class="form-control"
          />
        </div>
      </div>
    </div>
    <div
      v-for="(consent) in consentCheckboxes"
      :key="consent.key"
      class="row"
    >
      <div class="col-12">
        <div class="form-group">
          <input
            :id="consent.key"
            :value="consent.key"
            v-model="checkedConsents"
            :required="consent.required"
            type="checkbox"
          >
          <form-label :for="consent.key" :required="consent.required">
            <div class="consent-html" v-html="consent.html" />
          </form-label>
        </div>
      </div>
    </div>
    <pre v-if="error" class="alert alert-danger text-danger">An error occurred: {{ error }}</pre>
    <vue-recaptcha
      ref="invisibleRecaptcha"
      size="invisible"
      :sitekey="sitekey"
      :load-recaptcha-script="true"
      @verify="onVerify"
      @expired="onExpired"
    />
    <button type="submit" class="btn btn-primary" :disabled="loading">
      {{ translate("submitLabel") }}
    </button>
  </form>
  <div v-else>
    Thanks for your inquiry! We'll reach out shortly.
  </div>
</template>

<script>
import VueRecaptcha from 'vue-recaptcha';
import FormMixin from './form-mixin';
import CountryField from './fields/country.vue';
import FormLabel from './elements/label.vue';
import i18n from '../i18n';

export default {
  components: { VueRecaptcha, CountryField, FormLabel },
  inject: ['EventBus'],
  mixins: [
    FormMixin,
  ],
  props: {
    formClass: {
      type: String,
      default: null,
    },
    sitekey: {
      type: String,
      required: true,
    },
    lang: {
      type: String,
      default: 'en',
    },
    consentCheckboxes: {
      type: Array,
      default: () => [],
    },
  },
  data: () => ({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    country: '',
    postalCode: '',
    comments: '',
    checkedConsents: [],
  }),
  methods: {
    translate(key) {
      return i18n(this.lang, key);
    },
    onSubmit() {
      this.$refs.invisibleRecaptcha.execute();
    },
    onVerify(response) {
      this.submit(response);
    },
    onExpired() {
      this.error = 'Timed out validating your submission.';
      this.loading = false;
    },
    async submit(token) {
      const {
        contentId,
        contentType,
        firstName,
        lastName,
        email,
        phone,
        company,
        jobTitle,
        country,
        postalCode,
        comments,
        checkedConsents,
      } = this;
      const consents = this.consentCheckboxes.reduce((obj, consent) => {
        const { key, html } = consent;
        return (checkedConsents.includes(key)) ? { ...obj, [key]: html } : obj;
      }, {});
      const payload = {
        firstName,
        lastName,
        email,
        confirmationEmail: email,
        phone,
        company,
        jobTitle,
        country,
        postalCode,
        comments,
        ...consents,
        token,
      };
      await this.$submit(payload);
      this.EventBus.$emit('inquiry-form-submit', { contentId, contentType, payload });
    },
  },
};
</script>
