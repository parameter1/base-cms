<template>
  <button
    :class="classes"
    type="button"
    @click="toggle"
  >
    <span>{{ translate("viewAllComments") }}</span>
  </button>
</template>

<script>
import EventBus from '@parameter1/base-cms-marko-web/browser/event-bus';
import get from '@parameter1/base-cms-marko-web-identity-x/browser/utils/get';
import i18n from './i18n-vue';

export default {

  props: {
    identifier: {
      type: String,
      required: true,
    },
    classes: {
      type: String,
      default: null,
    },
    isExpanded: {
      type: Boolean,
      default: false,
    },
    targets: {
      type: Array,
      default: () => [],
    },
    toggleClass: {
      type: String,
      required: true,
    },
    lang: {
      type: String,
      default: 'en',
    },
  },

  data: () => ({
    error: null,
    expanded: false,
    isLoading: false,
    totalCount: 0,
  }),

  created() {
    this.expanded = this.isExpanded;
    this.loadCount();
  },

  methods: {
    /**
     *
     */
    async loadCount() {
      try {
        this.error = null;
        this.isLoading = true;
        const res = await get(`/comment-count/${this.identifier}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        this.totalCount = data.totalCount;
      } catch (e) {
        this.error = e;
      } finally {
        this.isLoading = false;
      }
    },

    toggle() {
      this.expanded = !this.expanded;
      EventBus.$emit('comments-expanded', this.expanded);
      const elements = document.querySelectorAll(this.targets.join(','));
      Array.prototype.forEach.call(elements, el => el.classList.toggle(this.toggleClass));
    },
    translate(key) {
      return i18n(this.lang, key);
    },
  },
};
</script>
