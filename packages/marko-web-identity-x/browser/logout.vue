<template>
  <div v-if="error">
    <p>{{ error }}</p>
  </div>
  <div v-else>
    <p>Logging out...</p>
  </div>
</template>

<script>
import redirect from './utils/redirect';
import getReferringPage from './utils/get-referring-page';
import cookiesEnabled from './utils/cookies-enabled';
import post from './utils/post';
import LogoutError from './errors/logout';
import FeatureError from './errors/feature';

export default {
  props: {
    redirectTo: {
      type: String,
      default: null,
    },
    eventLabel: {
      type: String,
      default: 'logout',
    },
  },
  data: () => ({
    error: null,
  }),
  mounted() {
    if (cookiesEnabled()) {
      this.$emit('displayed', { label: this.eventLabel });
      this.logout();
    } else {
      const error = new FeatureError('Your browser does not support cookies. Please enable cookies to use this feature.');
      this.error = error.message;
    }
  },
  methods: {
    /**
     *
     */
    async logout() {
      this.error = null;
      try {
        const res = await post('/logout');
        const data = await res.json();
        if (!res.ok) throw new LogoutError(data.message, res.status);
        this.$emit('submitted', { label: this.eventLabel, data });
        this.redirect();
      } catch (e) {
        this.error = `Unable to logout: ${e.message}`;
        this.$emit('errored', { label: this.eventLabel, message: e.message });
      }
    },

    redirect() {
      const to = this.redirectTo ? this.redirectTo : getReferringPage();
      redirect(to);
    },
  },
};
</script>
