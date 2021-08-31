const { URL } = require('url');

const buildInstagramElement = ({
  href,
  lazy = true,
  width,
}) => {
  const src = `${href.replace(/\/+$/g, '')}/embed/?cr=1`;
  const params = {
    src,
    ...(lazy && { lazy: true }),
    ...(width && { width }),
  };
  const data = Object.keys(params).map(key => `${key}="${params[key]}"`);
  if (data.lazy) {
    data.loading = 'lazy';
  }
  return `
  <iframe class="instagram-media instagram-media-rendered"
  ${data.join(' ')}
  allowtransparency="true"
  frameborder="0"
  height="700px"
  scrolling="no"
  style="
  background: rgb(255, 255, 255);
  border: 1px solid rgb(219, 219, 219);
  margin: 0px 0px 0px; max-width: 700px;
  width: calc(100% - 2px);
  border-radius: 4px;
  box-shadow: none;
  display: block;
  padding: 0px;">
  </iframe>
  <script async="" defer="" src="//platform.instagram.com/en_US/embeds.js"></script>`;
};

const instagram = (url) => {
  const pattern = /instagram\.com/i;
  if (!pattern.test(url)) return null; // not a instagram URL.

  const { href, host } = new URL(url);
  // after checking for instagram URLs, treat all other instagram URLs as posts.
  if (!pattern.test(host)) return null; // instagram.com appears somewhere else in the URL.
  // return instagram div element
  return buildInstagramElement({ href });
};

/**
 *
 */
module.exports = (url) => {
  // convert embeds, as they no longer support oembed without auth
  const igPost = instagram(url);
  if (igPost) return igPost;
  return null;
};
