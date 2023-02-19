<template>
  <div :class="bem('container')">
    <div :class="bem('header')">
      {{ title }}
    </div>
    <form
      :class="bem('contents')"
      @submit.prevent="submit"
    >
      <div :class="bem('row')">
        <label
          :class="bem('label')"
          for="cuf__name"
        >
          Name
        </label>
        <input
          id="cuf__name"
          v-model="name"
          :class="[...bem('field'), 'form-control']"
          type="text"
          name="name"
          required
        >
      </div>
      <div :class="bem('row')">
        <label
          :class="bem('label')"
          for="cuf__phone"
        >
          Phone
        </label>
        <input
          id="cuf__phone"
          v-model="phone"
          :class="[...bem('field'), 'form-control']"
          type="text"
          name="phone"
          required
        >
      </div>
      <div :class="bem('row')">
        <label
          :class="bem('label')"
          for="cuf__email"
        >
          Email
        </label>
        <input
          id="cuf__email"
          v-model="email"
          :class="[...bem('field'), 'form-control']"
          type="email"
          name="email"
          required
        >
      </div>
      <div :class="bem('row')">
        <label
          :class="bem('label')"
          for="cuf__comments"
        >
          Comments
        </label>
        <textarea
          id="cuf__comments"
          v-model="comments"
          :class="[...bem('field'), 'form-control']"
          name="comments"
          required
        />
      </div>
      <hr>
      <div :class="bem('row')">
        <p
          v-if="recaptcha.error"
          :class="bem('text', ['danger'])"
        >
          A recaptcha error occurred {{ recaptcha.error.message }}
        </p>
        <p
          v-if="submitted"
          :class="bem('text', ['success'])"
        >
          {{ successMessage }}
        </p>
        <p
          v-else-if="loading"
          :class="bem('text', ['loading'])"
        >
          Hold up, we're processing your submission...
        </p>
        <p
          v-else-if="error"
          :class="bem('text', ['danger'])"
        >
          {{ errorLabel }} {{ error }}
        </p>
        <button
          type="submit"
          :class="bem('submit')"
          :disabled="disabled || recaptcha.loading || recaptcha.error"
        >
          Submit
        </button>
      </div>
    </form>
  </div>
</template>

<script>

import recaptchaLoad from '@parameter1/base-cms-marko-web-recaptcha/browser/load';
import recaptchaGetToken from '@parameter1/base-cms-marko-web-recaptcha/browser/get-token';

const block = 'contact-us-form';

export default {
  props: {
    title: {
      type: String,
      default: 'Drop us a line!',
    },
    siteKey: {
      type: String,
      required: true,
    },
    configName: {
      type: String,
      required: true,
    },
    successMessage: {
      type: String,
      default: 'Thanks! Your comments have been received.',
    },
    errorLabel: {
      type: String,
      default: 'Oh snap! There was a problem with your submission:',
    },
  },
  data: () => ({
    name: null,
    phone: null,
    email: null,
    comments: null,
    error: null,
    loading: false,
    submitted: false,
    recaptcha: { loading: false, error: null },
  }),
  computed: {
    disabled() {
      return !(this.name && this.phone && this.email && this.comments && !this.loading);
    },
  },

  created() {
    this.loadRecaptcha();
  },

  methods: {
    bem: (name, mod = []) => [block, `${block}__${name}`, ...mod.map((m) => `${block}__${name}--${m}`)],
    async loadRecaptcha() {
      try {
        this.recaptcha.loading = true;
        this.recaptcha.error = null;
        await recaptchaLoad({ siteKey: this.siteKey });
      } catch (e) {
        this.recaptcha.error = e;
      } finally {
        this.recaptcha.loading = false;
      }
    },
    async submit() {
      this.loading = true;
      this.error = null;

      const token = await recaptchaGetToken({ siteKey: this.siteKey, action: 'contactUsSubmit' });

      if (token) {
        // eslint-disable-next-line no-underscore-dangle
        const payload = { ...this._data, configName: this.configName, token };
        try {
          const res = await fetch('/__contact-us', {
            method: 'post',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' },
          });
          if (res.ok) {
            this.submitted = true;
          } else {
            throw new Error(res.statusText);
          }
        } catch (e) {
          this.error = e.message;
        } finally {
          this.loading = false;
        }
      } else {
        this.error = 'Unable to submit your request. Please try again!';
        this.loading = false;
      }
    },
  },
};
</script>
