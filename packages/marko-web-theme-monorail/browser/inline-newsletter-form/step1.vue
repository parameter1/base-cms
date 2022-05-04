<template>
  <div :class="blockName">
    <div
      v-if="imageSrc"
      :class="`${blockName}__left-col`"
    >
      <img :src="imageSrc" :srcset="imageSrcset" :alt="name">
    </div>
    <div :class="`${blockName}__right-col`">
      <div :class="`${blockName}__title`">
        {{ name }}
      </div>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div :class="`${blockName}__description`" v-html="description" />

      <form :class="`${blockName}__form`" @submit.prevent="submit">
        <div :class="`${blockName}__email-group`">
          <label for="inline-newsletter-email" class="sr-only">Email</label>
          <input
            id="inline-newsletter-email"
            v-model="email"
            :class="`${blockName}__email-input`"
            :disabled="isLoading"
            class="form-control"
            placeholder="Enter your email"
            type="email"
            required
            @focus="didFocus = true"
          >
        </div>
        <sign-up-button
          :class="`${blockName}__form-button`"
          :is-loading="isLoading"
          :disabled="disabled"
        />
      </form>
      <privacy-policy :block-name="blockName" :privacy-policy-link="privacyPolicyLink" />


      <div v-if="error" class="alert alert-danger mt-3 mb-0" role="alert">
        <strong>An error ocurred.</strong>
        {{ error.message }}
      </div>
    </div>
  </div>
</template>


<script>
import PrivacyPolicy from '../newsletter-signup-form/privacy-policy.vue';
import SignUpButton from '../newsletter-signup-form/sign-up-button.vue';

import getRecaptchaToken from '../newsletter-signup-form/get-recaptcha-token';

export default {
  components: {
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
  },

  data: () => ({
    blockName: 'inline-newsletter-form-step1',
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
