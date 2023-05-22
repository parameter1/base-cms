<template>
  <div class="download-related__wrapper">
    <p v-if="items.length">
      Based on your interest in this {{ content.type }}, we'd recommend these items for you:
    </p>
    <div v-for="item in items" :key="item.id" class="download-related__item">
      <div class="download-related__image">
        <img
          v-if="item.primaryImage"
          :src="imgixUrl(item.primaryImage.src)"
          :alt="item.primaryImage.alt"
        >
      </div>
      <div class="download-related__title">
        <h3>{{ item.name }}</h3>
        <small v-if="item.company">
          from <strong>{{ item.company.name }}</strong>
        </small>
      </div>
      <div class="download-related__button">
        <button type="button" class="btn btn-primary" @click="$emit('submit', item)">
          Download
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import getAsArray from './utils/get-as-array';
import allPublishedContent from './graphql/queries/download-related-content';

export default {

  inject: ['$graphql'],

  props: {
    content: {
      type: Object,
      default: () => ({}),
    },
    limit: {
      type: Number,
      default: 4,
    },
    types: {
      type: Array,
      default: () => (['Document', 'Whitepaper']),
    },
  },

  data: () => ({
    loading: false,
    items: [],
  }),

  mounted() {
    this.load();
  },

  methods: {
    imgixUrl(url) {
      const Url = new URL(url);
      const usp = Url.searchParams;
      usp.set('h', 107);
      usp.set('w', 160);
      usp.set('fit', 'crop');
      return Url;
    },
    async load() {
      this.loading = true;
      try {
        // Start with directly related items
        const items = [
          ...getAsArray(this.content, 'relatedTo.edges')
            .map(({ node }) => node)
            .slice(0, this.limit),
        ];
        // Get from primary section
        if (items.length < this.limit) {
          const limit = this.limit - items.length;
          const input = {
            sectionId: this.content.primarySection.id,
            includeContentTypes: this.types,
            excludeContentIds: items.map((doc) => doc.id),
            pagination: { limit },
          };
          const data = await this.$graphql.query({
            query: allPublishedContent,
            variables: { input },
            // headers: {},
          });
          getAsArray(data, 'data.allPublishedContent.edges').forEach((doc) => items.push(doc.node));
        }
        // Get latest published items
        if (items.length < this.limit) {
          const limit = this.limit - items.length;
          const input = {
            sectionId: this.content.primarySection.id,
            includeContentTypes: this.types,
            excludeContentIds: items.map((doc) => doc.id),
            pagination: { limit },
          };
          const data = await this.$graphql.query({
            query: allPublishedContent,
            variables: { input },
            // headers: {},
          });
          getAsArray(data, 'data.allPublishedContent.edges').forEach((doc) => items.push(doc.node));
        }
        this.items = items;
      } catch (e) {
        this.error = e.message;
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
