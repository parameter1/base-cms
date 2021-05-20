<template>
  <form v-if="incomplete" :class="formClass" @submit.prevent="onSubmit">
    <input type="hidden" name="contentId" :value="contentId">
    <input type="hidden" name="contentType" :value="contentType">
    <div class="row">
      <div class="col-md-6">
        <div class="form-group">
          <form-label v-if="labels.firstName" id="inquiry-form.first-name" :required="true">
            {{ labels.firstName }}
          </form-label>
          <form-label v-else id="inquiry-form.first-name" :required="true">
            First Name
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
          <form-label v-if="labels.lastName" id="inquiry-form.last-name" :required="true">
            {{ labels.lastName }}
          </form-label>
          <form-label v-else id="inquiry-form.last-name" :required="true">
            Last Name
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
          <form-label v-if="labels.email" id="inquiry-form.email" :required="true">
            {{ labels.email }}
          </form-label>
          <form-label v-else id="inquiry-form.email" :required="true">
            Email Address
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
          <form-label v-if="labels.phone" id="inquiry-form.phone">
            {{ labels.phone }}
          </form-label>
          <form-label v-else id="inquiry-form.phone">
            Phone Number
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
          <form-label v-if="labels.company" id="inquiry-form.company">
            {{ labels.company }}
          </form-label>
          <form-label v-else id="inquiry-form.company">
            Company Name
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
          <form-label v-if="labels.jobTitle" id="inquiry-form.job-title" :required="true">
            {{ labels.jobTitle }}
          </form-label>
          <form-label v-else id="inquiry-form.job-title" :required="true">
            Job Title
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
        <country-field
          v-model="country"
          :required="true"
          :label="labels.country"
          :place-holder="labels.countryPlaceholder"
        />
      </div>
      <div class="col-md-6">
        <div class="form-group">
          <form-label v-if="labels.zip" id="inquiry-form.postal-code">
            {{ labels.zip }}
          </form-label>
          <form-label v-else id="inquiry-form.postal-code">
            ZIP/Postal Code
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
          <form-label v-if="labels.comments" id="inquiry-form.comments">
            {{ labels.comments }}
          </form-label>
          <form-label v-else id="inquiry-form.comments">
            Comments
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
    <pre v-if="error" class="alert alert-danger text-danger">An error occurred: {{ error }}</pre>
    <vue-recaptcha
      ref="invisibleRecaptcha"
      size="invisible"
      :sitekey="sitekey"
      :load-recaptcha-script="true"
      @verify="onVerify"
      @expired="onExpired"
    />
    <button
      v-if="labels.submit"
      type="submit"
      class="btn btn-primary"
      :disabled="loading"
    >
      {{ labels.submit }}
    </button>
    <button
      v-else
      type="submit"
      class="btn btn-primary"
      :disabled="loading"
    >
      Submit
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
    labels: {
      type: Object,
      required: false,
      default: null,
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
  }),
  methods: {
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
      } = this;

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
        token,
      };

      await this.$submit(payload);
      this.EventBus.$emit('inquiry-form-submit', { contentId, contentType, payload });
    },
  },
};
</script>
