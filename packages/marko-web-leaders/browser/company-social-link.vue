<template>
  <a
    :href="href"
    target="_blank"
    class="social-icon-link"
    :title="title"
    rel="nofollow"
    @click="emitAction"
  >
    <component :is="icon" :modifiers="modifiers" />
  </a>
</template>

<script>
import IconAnchor from '@parameter1/base-cms-marko-web-icons/browser/anchor.vue';
import IconFacebook from '@parameter1/base-cms-marko-web-icons/browser/facebook.vue';
import IconInstagram from '@parameter1/base-cms-marko-web-icons/browser/instagram.vue';
import IconLinkedin from '@parameter1/base-cms-marko-web-icons/browser/linkedin.vue';
import IconPinterest from '@parameter1/base-cms-marko-web-icons/browser/pinterest.vue';
import IconTwitter from '@parameter1/base-cms-marko-web-icons/browser/twitter.vue';
import IconOther from '@parameter1/base-cms-marko-web-icons/browser/link-external.vue';
import IconMegaphoneSpotify from '@parameter1/base-cms-marko-web-icons/browser/megaphone-spotify.vue';
import IconYoutube from '@parameter1/base-cms-marko-web-icons/browser/youtube.vue';

export default {
  components: {
    IconAnchor,
    IconFacebook,
    IconInstagram,
    IconLinkedin,
    IconOther,
    IconPinterest,
    IconMegaphoneSpotify,
    IconTwitter,
    IconYoutube,
  },
  props: {
    companyId: {
      type: Number,
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    href: {
      type: String,
      required: true,
    },
    provider: {
      type: String,
      required: true,
    },
  },
  data: () => ({
    modifiers: ['dark', 'lg'],
  }),
  computed: {
    icon() {
      return `icon-${this.provider}`;
    },
    title() {
      return `Visit us on ${this.provider.charAt(0).toUpperCase()}${this.provider.slice(1)}`;
    },
  },
  methods: {
    emitAction() {
      const payload = {
        category: 'Leaders Company Profile',
        type: 'click',
        label: `Company Social - ${this.provider}`,
      };
      const data = {
        companyId: this.companyId,
        companyName: this.companyName,
        href: this.href,
      };
      this.$emit('action', payload, data);
    },
  },
};
</script>
