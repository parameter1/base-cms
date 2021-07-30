const ToggleFiltersButton = () => import(/* webpackChunkName: "marko-web-search-toggle-filters-button" */ './toggle-filters-button.vue');

export default (Browser) => {
  Browser.register('MarkoWebSearchToggleFiltersButton', ToggleFiltersButton);
};
