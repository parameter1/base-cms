<template>
  <div ref="companySearch" class="company-search">
    <autocomplete
      ref="autocomplete"
      :search="searchCompanies"
      :class="errorClass"
      placeholder="Search Companies..."
      aria-label="Search Companies..."
      :get-result-value="getResultValue"
      :debounce-time="500"
      @submit="handleSubmit"
    />
  </div>
</template>

<script>
import Autocomplete from '@trevoreyre/autocomplete-vue';

const path = '/__company-search?searchQuery=';

export default {
  inject: ['EventBus'],
  components: { Autocomplete },

  data: () => ({
    errorClass: '',
  }),

  methods: {
    // We want to display the title
    getResultValue(result) {
      return result.shortName;
    },
    // Open the selected company in a new window
    handleSubmit(result) {
      // Handle when the result is an error or missing context link
      if (!result.siteContext || !result.siteContext.path) {
        this.$refs.autocomplete.value = '';
        return;
      }

      this.emitAction();
      window.location.href = result.siteContext.path;
    },
    searchCompanies(input) {
      this.errorClass = '';
      if (input.length < 3) {
        return [];
      }
      return this.getCompanyResults(input);
    },
    async getCompanyResults(input) {
      try {
        const url = `${path}${encodeURI(input)}`;
        const res = await fetch(url);
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || res.statusText);
        return json.nodes;
      } catch (error) {
        const errorNodes = [{
          id: 'error',
          shortName: error.message,
        }];
        this.errorClass = 'errors';
        return errorNodes;
      }
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
