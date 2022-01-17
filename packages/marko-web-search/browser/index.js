const ToggleFilterContainer = () => import(/* webpackChunkName: "marko-web-search-toggle-filter-container" */ './toggle-filters-button.vue');
const ToggleFilter = () => import(/* webpackChunkName: "marko-web-search-toggle-filter" */ './toggle-filter-button.vue');
const SortSelect = () => import(/* webpackChunkName: "marko-web-search-sort-select" */ './sort-select.vue');

export default (Browser) => {
  Browser.register('MarkoWebSearchToggleFilterContainer', ToggleFilterContainer);
  Browser.register('MarkoWebSearchToggleFilter', ToggleFilter);
  Browser.register('MarkoWebSearchSortSelect', SortSelect);
};
