<template>
  <div v-if="parents.length" class="leaders-sections-wrapper">
    <div
      v-for="section in parents"
      :key="section.id"
      class="leaders-section leaders-section--with-parent"
    >
      <div class="leaders-section__title">
        {{ section.name }}
      </div>
      <div class="leaders-section__children">
        <leaders-columns
          v-slot="{ sections: colSections }"
          :number="columns"
          :sections="getChildren(section)"
        >
          <leaders-section
            v-for="colSection in colSections"
            :key="colSection.id"
            :section-id="colSection.id"
            :title="colSection.name"
            :open="open"
            :expanded="expanded"
            :contextual="contextual"
            :offset-top="offsetTop"
            :offset-bottom="offsetBottom"
            :promotion-limit="promotionLimit"
            :video-limit="videoLimit"
            :featured-product-label="featuredProductLabel"
            :feature-youtube-videos="featureYoutubeVideos"
            :collapse-empty-categories="collapseEmptyCategories"
            :icon-style="iconStyle"
            @action="emitAction"
          />
        </leaders-columns>
      </div>
    </div>
  </div>
  <div v-else class="leaders-sections-wrapper">
    <leaders-columns
      v-slot="{ sections: colSections }"
      :number="columns"
      :sections="sections"
    >
      <leaders-section
        v-for="colSection in colSections"
        :key="colSection.id"
        :section-id="colSection.id"
        :title="colSection.name"
        :open="open"
        :expanded="expanded"
        :contextual="contextual"
        :offset-top="offsetTop"
        :offset-bottom="offsetBottom"
        :promotion-limit="promotionLimit"
        :video-limit="videoLimit"
        :icon-style="iconStyle"
        @action="emitAction"
      />
    </leaders-columns>
  </div>
</template>

<script>
import LeadersSection from './section.vue';
import LeadersColumns from './columns.vue';
import getAsArray from '../../utils/get-as-array';
import getEdgeNodes from '../../utils/get-edge-nodes';

export default {
  components: {
    LeadersSection,
    LeadersColumns,
  },

  props: {
    sections: {
      type: Array,
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
    columns: {
      type: Number,
      default: 1,
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
    iconStyle: {
      type: String,
      default: 'plus-minus',
      validator: (v) => ['plus-minus', 'chevron'].includes(v),
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
  },

  computed: {
    parents() {
      return this.sections.filter((section) => {
        const children = getAsArray(section, 'children.edges');
        return children.length > 0;
      });
    },
  },

  methods: {
    getChildren(section) {
      return getEdgeNodes(section, 'children');
    },

    emitAction(...args) {
      this.$emit('action', ...args);
    },
  },
};
</script>
