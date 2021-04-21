/* eslint-disable no-new */
import Vue from './vue';
import Components from './components';
import EventBus from './event-bus';
import './lazysizes';

const apollo = () => import(/* webpackChunkName: "apollo" */ './apollo');

const components = {};
const providers = {};
const requiresApollo = {};
const listeners = {};

const load = async ({
  el,
  name,
  props,
  on,
} = {}) => {
  if (!el || !name) throw new Error('A Vue component name and element must be provided.');
  const Component = components[name];
  if (!Component) throw new Error(`No Vue component found for '${name}'`);
  let apolloProvider;
  if (requiresApollo[name]) {
    const { default: provider } = await apollo();
    apolloProvider = provider;
  }
  new Vue({
    provide: providers[name],
    el,
    apolloProvider,
    render: h => h(Component, { props, on: { ...on, ...listeners[name] } }),
  });
};

const register = async (name, Component, { provide, withApollo, on } = {}) => {
  if (!name) throw new Error('A Vue component name must be provided.');
  if (components[name]) throw new Error(`A Vue component already exists for '${name}'`);
  components[name] = Component;
  providers[name] = provide;
  listeners[name] = on;
  if (withApollo) requiresApollo[name] = true;
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
const init = () => {
  if (initialized) return;
  const { markoCompQueue } = window;
  if (!markoCompQueue) throw new Error('Unable to load Marko Web components queue!');

  for (let i = 0; i < markoCompQueue.length; i += 1) {
    const [method, args] = markoCompQueue[i];
    if (methods[method]) methods[method](...args);
  }
  initialized = true;
};

export default {
  ...methods,
  init,
  EventBus,
};
