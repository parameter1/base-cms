<template>
  <div :class="classes" :data-taxonomy-ids="taxonomyIds.join(',') || null">
    <div v-if="title" class="leaders__header">
      <div class="leaders__header-title">
        {{ title }}
      </div>
    </div>
    <leaders-header
      v-else
      :display="getResponsiveValue('displayHeader')"
      :img-src="headerImgSrc"
      :img-alt="headerImgAlt"
      :img-width="headerImgWidth"
      :img-height="headerImgHeight"
      :display-callout="getResponsiveValue('displayCallout')"
      :callout-prefix="calloutPrefix"
      :callout-value="calloutValue"
    />
    <div class="leaders__body">
      <loading
        v-if="!hasLoaded"
        :is-loading="isLoading"
        :error="error"
        :has-no-results="!sections.length"
        loading-message="Loading sections..."
        no-results-message="No sections were found."
      />
      <leaders-sections-wrapper
        :sections="sections"
        :open="getResponsiveValue('open')"
        :expanded="isExpanded"
        :contextual="isContextual"
        :columns="getResponsiveValue('columns')"
        :offset-top="getResponsiveValue('offsetTop')"
        :offset-bottom="getResponsiveValue('offsetBottom')"
        :promotion-limit="promotionLimit"
        :video-limit="videoLimit"
        :featured-product-label="featuredProductLabel"
        :feature-youtube-videos="featureYoutubeVideos"
        :collapse-empty-categories="collapseEmptyCategories"
        :icon-style="iconStyle"
        :lang="lang"
        @action="emitAction"
      />
    </div>
    <div v-if="viewAll" class="leaders__footer">
      <a class="btn btn-primary" :href="viewAll" v-html="viewAllText" />
    </div>
  </div>
</template>

<script>
import Loading from './common/loading.vue';
import LeadersSectionsWrapper from './containers/section-wrapper.vue';
import LeadersHeader from './header.vue';

import allQuery from '../graphql/queries/all-sections';
import fromContentQuery from '../graphql/queries/sections-from-content';
import fromIdsQuery from '../graphql/queries/sections-from-ids';
import contentQuery from '../graphql/queries/content';
import getEdgeNodes from '../utils/get-edge-nodes';
import getAsObject from '../utils/get-as-object';
import getAsArray from '../utils/get-as-array';

export default {
  components: {
    Loading,
    LeadersHeader,
    LeadersSectionsWrapper,
  },

  inject: ['$graphql'],

  props: {
    sectionAlias: {
      type: String,
      required: true,
    },
    contentId: {
      type: Number,
      default: null,
    },
    sectionIds: {
      type: Array,
      default: () => ([]),
    },
    relatedSectionIds: {
      type: Array,
      default: () => ([]),
    },
    open: {
      type: String,
      default: 'left',
    },
    expanded: {
      type: Boolean,
      default: null,
    },
    contextual: {
      type: Boolean,
      default: null,
    },
    columns: {
      type: Number,
      default: 1,
    },
    mediaQueries: {
      type: Array,
      default: () => [],
      validator: (values) => values.every((value) => {
        if (!value || typeof value !== 'object') return false;
        const props = ['open', 'columns', 'expanded', 'displayHeader', 'displayCallout', 'offsetTop', 'offsetBottom'];
        if (!props.includes(value.prop)) return false;
        if (!value.query) return false;
        return Object.prototype.hasOwnProperty.call(value, 'value');
      }),
    },
    viewAllHref: {
      type: String,
      default: null,
    },
    viewAllText: {
      type: String,
      default: 'View All Companies &gt;',
    },
    displayHeader: {
      type: Boolean,
      default: true,
    },
    headerImgSrc: {
      type: String,
      default: null,
    },
    headerImgAlt: {
      type: String,
      default: null,
    },
    headerImgWidth: {
      type: String,
      default: '256',
    },
    headerImgHeight: {
      type: String,
      default: '90',
    },
    displayCallout: {
      type: Boolean,
      default: true,
    },
    calloutPrefix: {
      type: String,
      default: 'Browse these',
    },
    calloutValue: {
      type: String,
      default: 'leading suppliers',
    },
    title: {
      type: String,
      default: null,
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
    useContentPrimarySection: {
      type: Boolean,
      default: false,
    },
    useContentSchedules: {
      type: Boolean,
      default: false,
    },
    displayViewAll: {
      type: Boolean,
      default: true,
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
    lang: {
      type: String,
      default: 'en',
    },
  },

  data: () => ({
    loadType: null,
    taxonomyIds: [],
    sections: [],
    isLoading: false,
    hasLoaded: false,
    error: null,
    mqProps: {
      open: undefined,
      columns: undefined,
      displayHeader: undefined,
      displayCallout: undefined,
      offsetTop: undefined,
      offsetBottom: undefined,
    },
  }),

  computed: {
    viewAll() {
      if (!this.displayViewAll) return false;
      return this.viewAllHref || `/${this.sectionAlias}`;
    },
    isExpanded() {
      const { expanded } = this;
      if (expanded != null) return expanded;
      return this.isContextual;
    },
    isContextual() {
      const { contextual } = this;
      if (contextual != null) return contextual;
      return this.loadType === 'contextual';
    },
    classes() {
      const { loadType } = this;
      const blockName = 'leaders';
      const classes = [blockName];
      if (loadType) classes.push(`${blockName}--${loadType}`);
      return classes;
    },
    canLoad() {
      return !this.isLoading || !this.hasLoaded;
    },
  },

  created() {
    this.createMediaQueryListeners();
  },

  mounted() {
    this.load();
  },

  methods: {
    emitAction(...args) {
      this.$emit('action', ...args);
    },

    createMediaQueryListeners() {
      this.mediaQueries.forEach((media) => {
        const listener = (query) => {
          const { prop, value } = media;
          this.mqProps[prop] = query.matches ? value : undefined;
        };
        const query = window.matchMedia(media.query);
        listener(query);
        query.addListener(listener);
      });
    },

    getResponsiveValue(prop) {
      const value = this[prop];
      const mqValue = this.mqProps[prop];
      if (mqValue === undefined) return value;
      return mqValue;
    },

    async load() {
      if (this.canLoad) {
        this.isLoading = true;
        this.error = null;
        try {
          this.sections = await this.loadSections();
          this.hasLoaded = true;
        } catch (e) {
          this.error = e;
        } finally {
          this.isLoading = false;
        }
      }
    },

    async loadSections() {
      const { sectionIds, relatedSectionIds } = this;
      // Look up leadership sections by ID
      if (sectionIds && sectionIds.length) {
        const variables = { sectionIds };
        const r = await this.$graphql.query({ query: fromIdsQuery, variables });
        const sections = getEdgeNodes(r, 'data.websiteSections')
          .filter((s) => s.hierarchy.some(({ alias }) => alias === this.sectionAlias));
        if (sections.length) return sections;
      }
      // Look up leadership sections by related IDs
      if (relatedSectionIds && relatedSectionIds.length) {
        const variables = { relatedSectionIds, taxonomyIds: [] };
        const r = await this.$graphql.query({ query: fromContentQuery, variables });
        const sections = getEdgeNodes(r, 'data.websiteSections')
          .filter((s) => s.hierarchy.some(({ alias }) => alias === this.sectionAlias));
        if (sections.length) return sections;
      }
      // Look up leadership sections by content taxonomy, scheduling, and primary section
      const fromContent = await this.loadContentSections();
      if (fromContent.length) {
        this.loadType = 'contextual';
        return fromContent;
      }
      return this.loadAllSections();
    },

    async loadContentSections() {
      if (!this.contentId) return [];
      const variables = { contentId: this.contentId };
      const r1 = await this.$graphql.query({ query: contentQuery, variables });
      const taxonomyIds = getEdgeNodes(r1, 'data.content.taxonomy').map((t) => t.id);
      const sectionIds = [];
      this.taxonomyIds = taxonomyIds;
      if (this.useContentPrimarySection) {
        const primarySection = getAsObject(r1, 'data.content.primarySection');
        if (primarySection.id) sectionIds.push(primarySection.id);
      }
      if (this.useContentSchedules) {
        const schedules = getAsArray(r1, 'data.content.websiteSchedules');
        if (schedules.length) {
          sectionIds.push(...schedules.map((schedule) => schedule.section.id));
        }
      }
      if (!taxonomyIds.length && !sectionIds.length) return [];
      if (sectionIds.length) {
        const v2 = { taxonomyIds: [], relatedSectionIds: sectionIds };
        const r2 = await this.$graphql.query({ query: fromContentQuery, variables: v2 });
        const sections = getEdgeNodes(r2, 'data.websiteSections');
        const applicableSections = sections
          .filter((s) => s.hierarchy.some(({ alias }) => alias === this.sectionAlias));
        if (applicableSections.length) return applicableSections;
      }
      if (taxonomyIds.length) {
        const v3 = { taxonomyIds, relatedSectionIds: [] };
        const r3 = await this.$graphql.query({ query: fromContentQuery, variables: v3 });
        const taxonomyRelatedSections = getEdgeNodes(r3, 'data.websiteSections');
        const lastChanceSections = taxonomyRelatedSections
          .filter((s) => s.hierarchy.some(({ alias }) => alias === this.sectionAlias));
        if (lastChanceSections.length) return lastChanceSections;
      }
      return [];
    },

    async loadAllSections() {
      const variables = { sectionAlias: this.sectionAlias };
      const { data } = await this.$graphql.query({ query: allQuery, variables });
      this.loadType = 'all';
      return getEdgeNodes(data, 'websiteSectionAlias.children');
    },
  },
};
</script>
