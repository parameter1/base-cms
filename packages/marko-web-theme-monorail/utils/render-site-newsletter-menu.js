const { randomElementId } = require('@parameter1/base-cms-utils');
const renderVueSSRComponent = require('@parameter1/base-cms-marko-web/utils/render-ssr-component-from-marko');
const buildProps = require('./site-newsletter-menu-props');

module.exports = async ({ out }) => {
  const props = buildProps({ out });
  if (!props.name || !props.description) return '';
  return renderVueSSRComponent({
    id: randomElementId({ prefix: 'vue' }),
    input: {
      name: 'ThemeSiteNewsletterMenu',
      props,
    },
    out,
  });
};
