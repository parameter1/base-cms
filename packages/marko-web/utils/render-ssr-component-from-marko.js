const renderComponent = require('./render-ssr-component');
const BrowserComponentScript = require('../components/browser-component/script');

module.exports = async ({ id, input, out }) => {
  const { name, props } = input;
  const { compiledVueComponents } = out.global;
  const Component = compiledVueComponents[name];
  if (!Component) throw new Error(`No compiled Vue template found for ${name}. Unable to render server-side.`);
  const html = await renderComponent(Component, { id, props });
  const script = BrowserComponentScript.renderToString({
    id,
    hydrate: true,
    name,
    props,
    skipWhenExists: input.skipWhenExists,
  });
  console.log({ script });
  return `${html}${script}`;
};
