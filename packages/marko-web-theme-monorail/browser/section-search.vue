<template>
  <div ref="search" class="section-search" :class="{'open':openSuggestion}">
    <input
      v-model="selection"
      class="form-control"
      type="text"
      placeholder="Search Categories..."
    >
    <div v-if="selection" class="list-group">
      <div v-for="suggestion in matches" :key="suggestion" class="list-group-item">
        <a :href="'/'+suggestion.alias" @click="emitAction()">
          {{ suggestion.name }}
        </a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  inject: ['EventBus'],
  props: {
    sections: {
      type: Array,
      required: true,
    },
  },

  data() {
    return {
      open: false,
      current: 0,
      selection: '',
    };
  },

  computed: {
    matches() {
      return this.sections.filter((section) => {
        const match = section.name.toLowerCase().indexOf(this.selection.toLowerCase()) >= 0;
        return match;
      });
      // return this.sectionNames.filter((str) => {
      //   const match = str.toLowerCase().indexOf(this.selection.toLowerCase()) >= 0;
      //   return match;
      // });
    },
    openSuggestion() {
      return this.selection !== ''
      && this.matches.length !== 0
      && this.open === true;
    },
  },

  mounted() {
    this.addListeners();
  },

  beforeDestroy() {
    this.removeListeners();
  },

  methods: {
    detectOutclick(event) {
      const el = this.$refs.search;
      if (!el.contains(event.target) && el !== event.target) {
        this.selection = '';
      }
    },

    addListeners() {
      document.addEventListener('click', this.detectOutclick.bind(this));
      document.addEventListener('touchstart', this.detectOutclick.bind(this));
    },
    removeListeners() {
      document.removeEventListener('click', this.detectOutclick.bind(this));
      document.removeEventListener('touchstart', this.detectOutclick.bind(this));
    },
    emitAction() {
      const payload = {
        category: 'Content Header Search',
        action: 'Click',
        label: 'Website Section Page',
      };
      this.EventBus.$emit('content-header-search', payload);
    },
  },
};
</script>
