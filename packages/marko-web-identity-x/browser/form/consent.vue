<template>
  <div v-if="visible">
    <div v-if="emailConsentRequest" class="row mt-3">
      <div class="col-12">
        <receive-email
          v-model="user.receiveEmail"
          :email-consent-request="emailConsentRequest"
        />
      </div>
    </div>
    <div v-if="regionalPolicyFields.length" class="row mt-3">
      <div class="col-12">
        <regional-policy
          v-for="policy in regionalPolicyFields"
          :id="policy.id"
          :key="policy.id"
          :message="policy.message"
          :required="policy.required"
          :value="getRegionalPolicyAnswerValue(policy.id)"
          @input="setPolicyAnswer(policy.id, $event)"
        />
      </div>
    </div>
    <small
      v-if="consentPolicy"
      class="text-muted mb-3 d-inline-block"
      v-html="consentPolicy"
    />
  </div>
</template>
<script>
import ReceiveEmail from './fields/receive-email.vue';
import RegionalPolicy from './fields/regional-policy.vue';

export default {
  components: {
    ReceiveEmail,
    RegionalPolicy,
  },
  props: {
    user: {
      type: Object,
      default: () => ({}),
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
    regionalConsentPolicies: {
      type: Array,
      default: () => [],
    },
    countryCode: {
      type: String,
      default: null,
    },
    hideWhenAnswered: {
      type: Boolean,
      default: false,
    },
  },

  /**
   *
   */
  data() {
    return {
      currentUser: {
        ...this.user,
      },
    };
  },

  /**
   *
   */
  computed: {
  /**
   *
   */
    regionalPolicyFields() {
      const { regionalConsentPolicies, countryCode } = this;
      if (!regionalConsentPolicies.length || !countryCode) return [];
      return regionalConsentPolicies.filter((policy) => {
        const countryCodes = policy.countries.map((country) => country.id);
        return countryCodes.includes(countryCode);
      });
    },
    /**
     *
     */
    visible() {
      const { hideWhenAnswered } = this;
      if (!hideWhenAnswered) return true;
      if (!this.currentUser.receiveEmail) return true;
      if (this.regionalPolicyFields.length) {
        if (this.regionalPolicyFields.reduce(
          (policy) => this.getRegionalPolicyAnswerValue(policy.id),
        ).length) return true;
      }
      return false;
    },
  },

  /**
   *
   */
  methods: {
    /**
     *
     */
    getRegionalPolicyAnswer(policyId) {
      return this.user.regionalConsentAnswers.find((a) => a.id === policyId);
    },

    /**
     *
     */
    getRegionalPolicyAnswerValue(policyId) {
      const answer = this.getRegionalPolicyAnswer(policyId);
      if (answer) return answer.given;
      return false;
    },

    /**
     *
     */
    setPolicyAnswer(policyId, given) {
      const answer = this.getRegionalPolicyAnswer(policyId);
      if (answer) {
        answer.given = given;
      } else {
        this.user.regionalConsentAnswers.push({ id: policyId, given });
      }
    },
  },
};
</script>
