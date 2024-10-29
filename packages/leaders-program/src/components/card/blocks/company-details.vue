<template>
  <div class="leaders-company-details">
    <common-link
      v-if="logoSrc"
      :href="profileHref"
      title="View Company Profile"
      class="leaders-company-details__logo"
      @click="emitProfileClick('Company Logo', ...arguments)"
    >
      <!-- @todo update this to properly lazyload! -->
      <img
        class="lazyload"
        :src="logoSrc"
        :alt="logoAlt"
      >
    </common-link>

    <div class="leaders-company-details__links">
      <button-link
        v-if="companyHref"
        :href="companyHref"
        :block="true"
        target="_blank"
        type="accent"
        @click="emitWebsiteClick"
      >
        {{ translate("visitSiteLabel") }}
      </button-link>
      <button-link
        :href="profileHref"
        :block="true"
        @click="emitProfileClick('View Profile Button', ...arguments)"
      >
        {{ translate("viewProfileLabel") }}
      </button-link>
    </div>
  </div>
</template>

<script>
import i18n from '../../../utils/i18n-vue';
import ButtonLink from '../../common/button-link.vue';
import CommonLink from '../../common/link.vue';

export default {
  components: { ButtonLink, CommonLink },

  props: {
    companyName: {
      type: String,
      required: true,
    },
    profileHref: {
      type: String,
      required: true,
    },
    companyHref: {
      type: String,
      default: null,
    },
    lang: {
      type: String,
      default: 'en',
    },
    logoSrc: {
      type: String,
      default: null,
    },
  },

  computed: {
    logoAlt() {
      return `${this.companyName} Logo`;
    },
  },

  methods: {
    emitWebsiteClick(...args) {
      this.$emit('website-click', ...args);
    },
    emitProfileClick(sourceLabel, data, event) {
      this.$emit('profile-click', { sourceLabel, ...data }, event);
    },
    translate(key) {
      return i18n(this.lang, key);
    },
  },
};
</script>
