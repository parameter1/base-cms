const ToggleFilterContainer = () => import(/* webpackChunkName: "marko-web-search-toggle-filter-container" */ './toggle-filters-button.vue');
const ToggleFilter = () => import(/* webpackChunkName: "marko-web-search-toggle-filter" */ './toggle-filter-button.vue');

export default (Browser) => {
  Browser.register('MarkoWebSearchToggleFilterContainer', ToggleFilterContainer);
  Browser.register('MarkoWebSearchToggleFilter', ToggleFilter);
};
