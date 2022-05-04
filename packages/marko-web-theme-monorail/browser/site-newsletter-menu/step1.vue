<template>
  <div class="row">
    <div :class="element('image-wrapper', ['d-none', 'd-md-flex', 'col-md-5', 'col-lg-4'])">
      <img
        v-if="imageSrc"
        :src="imageSrc"
        :srcset="imageSrcset"
        :alt="name"
        :class="element('image')"
      >
    </div>
    <div :class="element('form-wrapper', ['col-12', 'col-md-6', 'col-lg-5'])">
      <div :class="element('name')">
        {{ name }}
      </div>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div :class="element('description')" v-html="description" />

      <form :class="element('form')" @submit.prevent="submit">
        <label for="newsletter-menu-email" class="sr-only">Email</label>
        <input
          id="newsletter-menu-email"
          v-model="email"
          class="form-control"
          :disabled="isLoading"
          placeholder="example@gmail.com"
          type="email"
          name="em"
          required
          @focus="didFocus = true"
        >
        <privacy-policy
          :block-name="blockName"
          :privacy-policy-link="privacyPolicyLink"
          :lang="lang"
        />
        <sign-up-button
          :class="element('form-button')"
          :is-loading="isLoading"
          :disabled="disabled"
          :lang="lang"
        />
      </form>

      <div v-if="error" class="alert alert-danger mt-3 mb-0" role="alert">
        <strong>An error ocurred.</strong>
        {{ error.message }}
      </div>
    </div>
    <div :class="element('close-container', ['d-none', 'd-md-flex', 'col-md-1', 'col-lg-3'])">
      <close-button
        :class-name="element('close').join(' ')"
        target-button=".site-navbar__newsletter-toggler"
        :icon-modifiers="['lg']"
      />
    </div>
  </div>
</template>

<script>
import CloseButton from '../newsletter-close-button.vue';
import PrivacyPolicy from '../newsletter-signup-form/privacy-policy.vue';
import SignUpButton from '../newsletter-signup-form/sign-up-button.vue';

import getRecaptchaToken from '../newsletter-signup-form/get-recaptcha-token';

export default {
  components: {
    CloseButton,
    PrivacyPolicy,
    SignUpButton,
  },
  props: {
    newsletter: {
      type: Object,
      required: true,
      validate: o => (o && o.name && o.deploymentTypeId),
    },
    recaptchaSiteKey: {
      type: String,
      required: true,
    },
    blockName: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    imageSrc: {
      type: String,
      default: null,
    },
    imageSrcset: {
      type: String,
      default: null,
    },
    privacyPolicyLink: {
      type: Object,
      required: true,
    },
    lang: {
      type: String,
      default: 'en',
    },
  },

  data: () => ({
    didFocus: false,
    email: null,
    error: null,
    isLoading: false,
  }),

  watch: {
    didFocus(value) {
      if (value) this.$emit('focus');
    },
  },

  methods: {
    element(elementName, classNames = []) {
      return [`${this.blockName}__${elementName}`, ...classNames];
    },

    async submit() {
      try {
        this.error = null;
        this.isLoading = true;
        const { email, newsletter } = this;
        const { deploymentTypeId } = newsletter;

        const token = await getRecaptchaToken(this.recaptchaSiteKey);
        const res = await fetch('/__omeda/newsletter-signup', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ deploymentTypeIds: [deploymentTypeId], email, token }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message);
        const { encryptedCustomerId } = json;
        this.$emit('submit', { email, encryptedCustomerId });
        this.$emit('subscribe', { newsletter });
      } catch (e) {
        this.error = e;
        this.$emit('error', e);
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>
