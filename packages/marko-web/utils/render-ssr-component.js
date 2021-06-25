const { get } = require('@parameter1/base-cms-object-path');
const Vue = require('vue');
const VueServerRenderer = require('vue-server-renderer');

const renderer = VueServerRenderer.createRenderer();
const EventBus = new Vue();

module.exports = async (Component, { id, props } = {}) => {
  if (get(Component, 'props.id')) throw new Error('The provided component has an `id` prop which is incompatible with SSR rendering.');
  const app = new Vue({
    provide: { EventBus },
    render: h => h(Component, { attrs: { id }, props }),
  });
  return renderer.renderToString(app);
};
