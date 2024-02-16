<template>
  <div v-if="!hasActiveUser">
    <p>Please log in before accessing this page.</p>
    <a
      :href="endpoints.login"
      class="btn btn-secondary"
      role="button"
    >
      {{ buttonLabels.login || "Log in" }}
    </a>
  </div>
  <div v-else-if="complete">
    <h4>Almost Done!</h4>
    <p>
      We just sent an email to <em>{{ email }}</em> with your confirmation link.
      To finish changing your email, open the email message and click the
      link within.
    </p>
    <p>You have now been logged out. To continue, click the link in your inbox.</p>
    <p>
      Note: please check your spam/junk folders.
      If you do not receive this email, your firewall or ISP has likely blocked it.
      Please add {{ senderEmailAddress }} to your whitelist and try registering again.
    </p>
  </div>
  <div v-else>
    <form @submit.prevent="handleSubmit">
      <email
        v-model="email"
        :placeholder="activeUser.email"
        :disabled="loading"
        :label="loginEmailLabel"
      />

      <small
        v-if="consentPolicyEnabled && consentPolicy"
        class="text-muted mb-1 d-block"
        v-html="consentPolicy"
      />
      <button
        type="submit"
        class="btn btn-primary"
        :disabled="loading"
      >
        {{ buttonLabels.continue || "Continue" }}
      </button>
      <p v-if="error" class="mt-3 text-danger">
        An error occurred: {{ error.message }}
      </p>
    </form>
  </div>
</template>

<script>
import Email from './form/fields/email.vue';

import post from './utils/post';
import cookiesEnabled from './utils/cookies-enabled';
import FormError from './errors/form';
import FeatureError from './errors/feature';
import EventEmitter from './mixins/global-event-emitter';

export default {
  /**
   *
   */
  components: {
    Email,
  },

  /**
   *
   */
  mixins: [EventEmitter],

  /**
   *
   */
  props: {
    activeUser: {
      type: Object,
      default: () => {},
    },
    endpoints: {
      type: Object,
      required: true,
    },
    buttonLabels: {
      type: Object,
      default: () => ({
        continue: 'Continue',
        login: 'Log in',
      }),
    },
    consentPolicy: {
      type: String,
      default: null,
    },
    consentPolicyEnabled: {
      type: Boolean,
      default: false,
    },
    appContextId: {
      type: String,
      default: null,
    },
    senderEmailAddress: {
      type: String,
      default: 'noreply@identity-x.parameter1.com',
    },
    loginEmailLabel: {
      type: String,
      default: 'Email Address',
    },
  },

  /**
   *
   */
  data: () => ({
    email: null,
    complete: false,
    error: null,
    loading: false,
  }),

  /**
   *
   */
  computed: {
    /**
     *
     */
    hasActiveUser() {
      return this.activeUser && this.activeUser.email;
    },
  },

  /**
   *
   */
  mounted() {
    if (cookiesEnabled()) {
      this.emit('change-email-mounted');
    } else {
      this.error = new FeatureError('Your browser does not support cookies. Please enable cookies to use this feature.');
      this.emit('change-email-errored', { message: this.error.message });
    }
  },

  /**
   *
   */
  methods: {
    /**
     *
     */
    async handleSubmit() {
      try {
        this.error = null;
        this.loading = true;
        const res = await post('/change-email/initiate', {
          email: this.email,
          appContextId: this.appContextId,
        });
        const data = await res.json();
        if (!res.ok) throw new FormError(data.message, res.status);
        this.complete = true;
        this.emit('change-email-link-sent', { data, email: this.email }, data.entity);
      } catch (e) {
        this.error = e;
        this.emit('change-email-errored', { message: e.message });
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
