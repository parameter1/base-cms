<template>
  <div v-if="isRedirecting">
    <p>You've successfully changed your email. Redirecting you...</p>
  </div>
  <div v-else-if="isLoading">
    <p>Changing your email...</p>
  </div>
  <div v-else-if="error" class="alert alert-danger" role="alert">
    <h5 class="alert-heading">
      Unable to change email
    </h5>
    <p>{{ error.message }}</p>
    <hr>
    <p class="mb-0">
      Please try <a :href="endpoints.login" class="alert-link">logging in</a> again.
    </p>
  </div>
</template>

<script>
import redirect from './utils/redirect';
import cookiesEnabled from './utils/cookies-enabled';
import post from './utils/post';
import AuthenticationError from './errors/authentication';
import FeatureError from './errors/feature';
import EventEmitter from './mixins/global-event-emitter';

export default {
  /**
   *
   */
  mixins: [EventEmitter],

  /**
   *
   */
  props: {
    token: {
      type: String,
      required: true,
    },
    endpoints: {
      type: Object,
      required: true,
    },
    redirectTo: {
      type: String,
      default: '/',
    },
    buttonLabel: {
      type: String,
      default: 'Submit',
    },
  },

  /**
   *
   */
  data: () => ({
    error: null,
    isLoading: false,
    isRedirecting: false,
  }),

  /**
   *
   */
  mounted() {
    if (cookiesEnabled()) {
      this.emit('change-email-mounted');
      this.changeEmail();
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
    async changeEmail() {
      this.isLoading = true;
      try {
        const { token } = this;
        if (!token) throw new Error('No change email token was provided.');

        const res = await post('/change-email/confirm', { token });
        const data = await res.json();

        if (!res.ok) throw new AuthenticationError(data.message, res.status);

        this.emit('change-email', { data }, data.entity);

        this.redirect();
      } catch (e) {
        if (/no token was found/i.test(e.message)) {
          e.message = 'This change email link has either expired or was already used.';
        }
        this.error = e;
        this.emit('change-email-errored', { message: e.message });
      } finally {
        this.isLoading = false;
      }
    },

    /**
     *
     */
    redirect() {
      this.isRedirecting = true;
      const redirectTo = this.isUserRedirect ? '/' : this.redirectTo;
      redirect(redirectTo);
    },
  },
};
</script>
