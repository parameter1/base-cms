<template>
  <div v-if="hasActiveUser">
    <p>You are currently logged in as {{ activeUser.email }}.</p>
    <a
      :href="endpoints.logout"
      class="btn btn-primary"
      role="button"
    >
      {{ buttonLabels.logout }}
    </a>
  </div>
  <div v-else-if="complete">
    <h4>Almost Done!</h4>
    <p>
      We just sent an email to <em>{{ email }}</em> with your one-time login link.
      To finish logging in, open the email message and click the link within.
    </p>
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
        :placeholder="loginEmailPlaceholder"
        :disabled="loading"
        :id="loginInputId"
      />
      <small
        v-if="consentPolicy"
        class="text-muted mb-3"
        v-html="consentPolicy"
      />
      <button
        type="submit"
        class="btn btn-primary"
        :disabled="loading"
      >
        {{ buttonLabels.continue }}
      </button>
      <p v-if="error" class="mt-3 text-danger">
        An error occurred: {{ error.message }}
      </p>
    </form>
  </div>
</template>

<script>
import Email from './form/fields/email.vue';

import cleanPath from './utils/clean-path';
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
    source: {
      type: String,
      default: 'login',
    },
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
        logout: 'Logout',
      }),
    },
    consentPolicy: {
      type: String,
      default: null,
    },
    redirect: {
      type: String,
      default: null,
    },
    appContextId: {
      type: String,
      default: null,
    },
    loginEmailPlaceholder: {
      type: String,
      default: null,
    },
    senderEmailAddress: {
      type: String,
      default: 'noreply@identity-x.parameter1.com',
    },

    /**
     * Regional consent polices to display (if/when a user selects a country on login)
     * if enabled.
     */
    regionalConsentPolicies: {
      type: Array,
      default: () => [],
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
    loginInputId: 'sign-on-email',
  }),

  /**
   *
   */
  computed: {
    /**
     *
     */
    authUrl() {
      return `${window.location.origin}/${cleanPath(this.endpoints.authenticate)}`;
    },

    /**
     *
     */
    hasActiveUser() {
      return this.activeUser && this.activeUser.email;
    },

    /**
     *
     */
    redirectTo() {
      const { redirect } = this;
      if (redirect) return redirect;
      const { pathname, search, hash } = window.location;
      return `${pathname}${search}${hash}`;
    },
  },

  /**
   *
   */
  mounted() {
    this.loginInputId = `${this.loginInputId}-${this._uid}`;
    if (cookiesEnabled()) {
      this.emit('login-mounted');
    } else {
      this.error = new FeatureError('Your browser does not support cookies. Please enable cookies to use this feature.');
      this.emit('login-errored', { message: this.error.message });
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
        const res = await post('/login', {
          email: this.email,
          source: this.source,
          redirectTo: this.redirectTo,
          authUrl: this.authUrl,
          appContextId: this.appContextId,
          additionalEventData: this.additionalEventData,
        });
        const data = await res.json();
        if (!res.ok) throw new FormError(data.message, res.status);
        this.complete = true;
        this.emit('login-link-sent', { data, source: this.source });
      } catch (e) {
        this.error = e;
        this.emit('login-errored', { message: e.message });
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
