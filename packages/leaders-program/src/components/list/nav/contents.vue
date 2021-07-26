<template>
  <span class="leaders-nav-link-contents">
    <filter-none-icon :modifiers="iconModifiers" />
    <span class="leaders-nav-link-contents__container">
      <span class="leaders-nav-link-contents__title">{{ title }}</span>
      <videocam-icon v-if="hasVideos" :modifiers="iconModifiers" />
    </span>
  </span>
</template>


<script>
import FilterNoneIcon from '../../icons/filter-none.vue';
import VideocamIcon from '../../icons/videocam.vue';

export default {
  components: { FilterNoneIcon, VideocamIcon },

  props: {
    title: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    hasVideos: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    iconModifiers() {
      const mods = [];
      if (this.isActive) mods.push('active');
      return mods;
    },
  },
};
</script>
