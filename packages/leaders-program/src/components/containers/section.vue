<template>
  <div v-if="!collapse" :class="classes" :data-section-id="sectionId">
    <button class="leaders-section__toggle-button" @click="toggleExpanded">
      <component :is="collapsedIcon" v-show="!isExpanded" :modifiers="iconModifiers" />
      <component :is="expandedIcon" v-show="isExpanded" :modifiers="iconModifiers" />
      <span class="leaders-section__toggle-button-title">{{ title }}</span>
    </button>
    <div v-if="isExpanded" class="leaders-section__list">
      <loading
        v-if="!hasLoaded"
        :is-loading="isLoading"
        :error="error"
        :has-no-results="!items.length"
        loading-message="Loading content..."
        no-results-message="No content was found."
      />
      <list
        v-else
        :items="items"
        :identifier="sectionId"
        :open="open"
        :offset-top="offsetTop"
        :offset-bottom="offsetBottom"
        nav-direction="vertical"
        @link-action="emitAction"
        @mounted="emitCategoryItems"
      >
        <template #nav-link="{ item, isActive }">
          <link-contents
            :title="item.name"
            :is-active="isActive"
            :has-videos="item.videos.edges.length > 0"
          />
        </template>
        <template #dropdown="{ item, isActive }">
          <card
            :company="item"
            :is-active="isActive"
            :featured-product-label="featuredProductLabel"
            :feature-youtube-videos="featureYoutubeVideos"
            @action="emitAction"
          />
        </template>
      </list>
    </div>
  </div>
</template>

<script>
import PlusIcon from '../icons/add-circle-outline.vue';
import MinusIcon from '../icons/remove-circle-outline.vue';
import ChevronRightIcon from '../icons/chevron-right.vue';
import ChevronDownIcon from '../icons/chevron-down.vue';
import Loading from '../common/loading.vue';

import List from '../list/index.vue';
import Card from '../card/index.vue';
import LinkContents from '../list/nav/contents.vue';

import query from '../../graphql/queries/content-for-section';
import getEdgeNodes from '../../utils/get-edge-nodes';

export default {
  components: {
    PlusIcon,
    MinusIcon,
    ChevronRightIcon,
    ChevronDownIcon,
    Loading,
    List,
    Card,
    LinkContents,
  },

  inject: ['$graphql'],

  props: {
    sectionId: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    open: {
      type: String,
      default: 'left',
    },
    expanded: {
      type: Boolean,
      default: false,
    },
    contextual: {
      type: Boolean,
      default: false,
    },
    offsetTop: {
      type: Number,
      default: 0,
    },
    offsetBottom: {
      type: Number,
      default: 0,
    },
    promotionLimit: {
      type: Number,
      default: 4,
    },
    videoLimit: {
      type: Number,
      default: 3,
    },
    featuredProductLabel: {
      type: String,
      default: 'Featured Products',
    },
    featureYoutubeVideos: {
      type: Boolean,
      default: true,
    },
    collapseEmptyCategories: {
      type: Boolean,
      default: false,
    },
    iconStyle: {
      type: String,
      default: 'plus-minus',
      validator: (v) => ['plus-minus', 'chevron'].includes(v),
    },
  },

  data: () => ({
    blockName: 'leaders-section',
    collapse: false,
    items: [],
    isLoading: false,
    hasLoaded: false,
    isExpanded: false,
    error: null,
  }),

  computed: {
    classes() {
      const { blockName } = this;
      const classes = [blockName];
      if (this.contextual) classes.push(`${blockName}--contextual`);
      return classes;
    },
    iconModifiers() {
      const mods = [];
      if (!this.contextual) mods.push('primary-color-light');
      return mods;
    },
    canLoad() {
      return this.isExpanded && (!this.isLoading || !this.hasLoaded);
    },
    hasChildren() {
      return Boolean(this.children.length);
    },
    expandedIcon() {
      if (this.iconStyle === 'chevron') return ChevronDownIcon;
      return MinusIcon;
    },
    collapsedIcon() {
      if (this.iconStyle === 'chevron') return ChevronRightIcon;
      return PlusIcon;
    },
  },

  watch: {
    isExpanded() {
      this.loadContent();
    },
  },

  created() {
    this.isExpanded = this.expanded;
  },

  methods: {
    elementClass(name) {
      return `${this.blockName}__${name}`;
    },

    emitAction(event, payload = {}) {
      this.$emit('action', event, {
        ...payload,
        sectionId: this.sectionId,
        sectionName: this.title,
      });
    },

    emitCategoryItems(items) {
      if (!items || !items.length) {
        this.collapse = this.collapseEmptyCategories;
        return;
      }
      this.emitAction({
        type: 'viewed',
        label: 'Section Company Items',
        category: 'Leaders Sections Nav',
      }, {
        sectionId: this.sectionId,
        sectionName: this.title,
        items: items.map((item) => ({ id: item.id, name: item.name })),
      });
    },

    toggleExpanded() {
      this.isExpanded = !this.isExpanded;
      this.emitAction({
        type: this.isExpanded ? 'expand' : 'collapse',
        label: 'Section Item',
        category: 'Leaders Sections Nav',
      }, {
        sectionId: this.sectionId,
        sectionName: this.title,
      });
    },

    async loadContent() {
      if (this.canLoad) {
        this.isLoading = true;
        this.error = null;
        try {
          const variables = {
            sectionId: this.sectionId,
            promotionLimit: this.promotionLimit,
            videoLimit: this.videoLimit,
          };
          const { data } = await this.$graphql.query({ query, variables });
          this.items = getEdgeNodes(data, 'websiteScheduledContent');
          this.hasLoaded = true;
        } catch (e) {
          this.error = e;
        } finally {
          this.isLoading = false;
        }
      }
    },
  },
};
</script>
