const renderComponent = require('./render-ssr-component');

module.exports = ({ id, input, out }) => {
  const { name } = input;
  const { compiledVueComponents } = out.global;
  const Component = compiledVueComponents[name];
  if (!Component) throw new Error(`No compiled Vue template found for ${name}. Unable to render server-side.`);
  return renderComponent(Component, { id, props: input.props });
};
