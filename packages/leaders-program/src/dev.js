/* eslint-disable no-new */
import Vue from 'vue';

import Leaders from './components/leaders.vue';
import createGraphQLClient from './graphql/create-client';

Vue.config.productionTip = false;

const components = {
  Leaders,
};

const loadComponent = ({
  el,
  name,
  graphql = {},
  props = {},
  on,
} = {}) => {
  const { uri, tenant, siteId } = graphql;
  if (!uri || !tenant || !siteId) throw new Error('The provided apollo config is invalid.');
  if (!components[name]) throw new Error(`No BaseCMS Management Component found for '${name}'`);
  const Component = components[name];
  new Vue({
    el,
    provide: {
      $graphql: createGraphQLClient({
        uri,
        headers: { 'x-tenant-key': tenant, 'x-site-id': siteId },
      }),
    },
    render: h => h(Component, { props, on }),
  });
};

const fns = { loadComponent };

const leaders = (fn, ...args) => {
  if (typeof fns[fn] === 'function') return fns[fn](...args);
  throw new Error(`No leaders function exists for '${fn}'`);
};

const { isArray } = Array;
const { leadersQueue } = window;

if (isArray(leadersQueue)) {
  leadersQueue.forEach((args) => {
    leaders(...args);
  });
}
window.leaders = leaders;
