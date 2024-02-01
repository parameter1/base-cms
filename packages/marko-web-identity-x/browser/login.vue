<template>
  <div v-if="hasActiveUser">
    <p>You are currently logged in as {{ activeUser.email }}.</p>
    <a
      :href="endpoints.profile"
      class="btn btn-secondary mb-2 mr-2"
      role="button"
    >
      {{ buttonLabels.profile || "Modify Profile" }}
    </a>
    <a
      :href="endpoints.logout"
      class="btn btn-primary mb-2 mr-2"
      role="button"
    >
      {{ buttonLabels.logout || "Log out" }}
    </a>
  </div>
  <div v-else-if="complete" v-html="almostDoneVerbiage" />
  <div v-else>
    <form @submit.prevent="handleSubmit">
      <email
        :id="loginEmailId"
        v-model="email"
        :placeholder="loginEmailPlaceholder"
        :disabled="loading"
        :label="loginEmailLabel"
        @focus="$emit('focus')"
      />

      <p v-if="requiresUserInput">
        Thanks! Additional information is required to continue:
      </p>
      <div v-if="requiresUserInput" class="row form-group">
        <div v-if="requiredCreateFields.includes('givenName')" class="col">
          <given-name
            v-model="givenName"
            :required="true"
            :disabled="loading"
            :label="defaultFieldLabels.givenName || 'First Name'"
          />
        </div>
        <div v-if="requiredCreateFields.includes('familyName')" class="col">
          <family-name
            v-model="familyName"
            :required="true"
            :disabled="loading"
            :label="defaultFieldLabels.familyName || 'Last Name'"
          />
        </div>
      </div>

      <small
        v-if="emailConsentRequestEnabled && emailConsentRequest"
        class="text-muted mb-1 d-block"
        v-html="emailConsentRequest"
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
import GivenName from './form/fields/given-name.vue';
import FamilyName from './form/fields/family-name.vue';

import cleanPath from './utils/clean-path';
import post from './utils/post';
import cookiesEnabled from './utils/cookies-enabled';
import FormError from './errors/form';
import FeatureError from './errors/feature';
import AutoSignupEventEmitter from './mixins/global-auto-signup-event-emitter';
import EventEmitter from './mixins/global-event-emitter';

export default {
  /**
   *
   */
  components: {
    Email,
    GivenName,
    FamilyName,
  },

  /**
   *
   */
  mixins: [EventEmitter, AutoSignupEventEmitter],

  /**
   *
   */
  props: {
    source: {
      type: String,
      default: 'default',
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
        profile: 'Modify Profile',
        logout: 'Logout',
      }),
    },
    defaultFieldLabels: {
      type: Object,
      default: () => {},
    },
    consentPolicy: {
      type: String,
      default: null,
    },
    consentPolicyEnabled: {
      type: Boolean,
      default: false,
    },
    emailConsentRequest: {
      type: String,
      default: null,
    },
    emailConsentRequestEnabled: {
      type: Boolean,
      default: false,
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
    actionText: {
      type: String,
      default: 'logging in',
    },
    loginEmailId: {
      type: String,
      default: 'sign-on-email',
    },
    loginEmailLabel: {
      type: String,
      default: 'Email Address',
    },

    /**
     * Regional consent polices to display (if/when a user selects a country on login)
     * if enabled.
     */
    regionalConsentPolicies: {
      type: Array,
      default: () => [],
    },

    requiredCreateFields: {
      type: Array,
      default: () => [],
    },

    lang: {
      type: String,
      default: 'en',
    },
  },

  /**
   *
   */
  data: () => ({
    email: null,
    givenName: null,
    familyName: null,
    complete: false,
    error: null,
    loading: false,
    requiresUserInput: false,
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

    almostDoneVerbiage() {
      if (this.lang === 'es') {
        return `<h4>Falta muy poco!</h4>
        <p>
          Enviamos un correo a <em>${this.email}</em> con su enlace de inicio de sesión único (caduca en una hora).
          Para terminar de  ${this.actionText || 'logging in'}, abra el mensaje de correo electrónico y haga clic en el enlace que contiene.
        </p>
        <p>
          Nota: por favor revise sus carpetas de spam/basura.
          Si no recibe este correo electrónico, es probable que su firewall o ISP lo haya bloqueado.
          Agregue ${this.senderEmailAddress} a su lista blanca e intente registrarse nuevamente.
        </p>`;
      }
      return `<h4>Almost Done!</h4>
      <p>
        We just sent an email to <em>${this.email}</em> with your one-time login link (expires in one hour).
        To finish ${this.actionText || 'logging in'}, open the email message and click the link within.
      </p>
      <p>
        Note: please check your spam/junk folders.
        If you do not receive this email, your firewall or ISP has likely blocked it.
        Please add ${this.senderEmailAddress} to your whitelist and try registering again.
      </p>`;
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
    if (cookiesEnabled()) {
      this.emit('login-mounted', this.data);
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
          // Append any additional required fields
          ...(this.requiredCreateFields.reduce((obj, key) => ({ ...obj, [key]: this[key] }), {})),
          source: this.source,
          redirectTo: this.redirectTo,
          authUrl: this.authUrl,
          appContextId: this.appContextId,
          additionalEventData: {
            ...this.additionalEventData,
            actionSource: this.source,
          },
        });
        const data = await res.json();
        if (!res.ok) {
          if (data.requiresUserInput) {
            this.requiresUserInput = true;
            return;
          }
          throw new FormError(data.message, res.status);
        }
        this.complete = true;
        this.emitAutoSignup(data);
        this.emit('login-link-sent', {
          data,
          email: this.email,
          source: this.source,
          additionalEventData: {
            ...(this.additionalEventData || {}),
            ...(data.additionalEventData || {}),
          },
        });
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
