/* eslint-disable no-new */
import Vue from './vue';
import Components from './components';
import EventBus from './event-bus';

const components = {};
const providers = {};
const listeners = {};

const load = async ({
  el,
  name,
  props,
  on,
  hydrate,
  skipWhenExists,
} = {}) => {
  if (!el || !name) throw new Error('A Vue component name and element must be provided.');
  const Component = components[name];
  if (!Component) throw new Error(`No Vue component found for '${name}'`);
  const shouldRender = skipWhenExists ? document.querySelectorAll(`script.component[data-name="${name}"]`).length <= 1 : true;
  if (!shouldRender) return;
  const component = new Vue({
    provide: providers[name],
    render: (h) => h(Component, { props, on: { ...on, ...listeners[name] } }),
  });
  component.$mount(el, hydrate);
};

const register = async (name, Component, { provide, on } = {}) => {
  if (!name) throw new Error('A Vue component name must be provided.');
  if (components[name]) throw new Error(`A Vue component already exists for '${name}'`);
  components[name] = Component;
  providers[name] = provide;
  listeners[name] = on;
};

/**
 * Register built-in components.
 */
Components({ register, EventBus });

/**
 * @deprecated Use `load` instead.
 */
const loadComponent = (el, name, props) => {
  load({ el, name, props });
};

/**
 * @deprecated Use `register` instead.
 */
const registerComponent = (name, Component, provide) => {
  register(name, Component, { provide });
};

const methods = {
  load,
  register,
  loadComponent,
  registerComponent,
};

let initialized = false;
if (window && window.markoCompQueue) {
  window.markoCompQueue.flush = () => {
    if (initialized) return;
    const { markoCompQueue } = window;
    if (!markoCompQueue) throw new Error('Unable to load Marko Web components queue!');

    for (let i = 0; i < markoCompQueue.length; i += 1) {
      const [method, args] = markoCompQueue[i];
      if (methods[method]) methods[method](...args);
    }
    window.CMSBrowserComponents = methods;
    initialized = true;
  };
}

export default {
  ...methods,
  EventBus,
};
