const { randomElementId } = require('@parameter1/base-cms-utils');
const renderVueSSRComponent = require('@parameter1/base-cms-marko-web/utils/render-ssr-component-from-marko');
const buildProps = require('./site-idx-newsletter-menu-props');

module.exports = async ({
  out,
  input,
  user,
  application,
}) => {
  const props = buildProps({
    out,
    input,
    user,
    application,
  });
  if (!props.name || !props.description) return '';
  return renderVueSSRComponent({
    id: randomElementId({ prefix: 'vue' }),
    input: {
      name: 'IdentityXNewsletterFormInline',
      props,
    },
    out,
  });
};
