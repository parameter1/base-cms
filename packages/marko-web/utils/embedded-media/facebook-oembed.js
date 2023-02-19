const { URL } = require('url');

const buildFacebookElement = ({
  href,
  lazy = true,
  width,
  showText,
}) => {
  const params = {
    href: decodeURIComponent(href),
    ...(lazy && { lazy: true }),
    ...(width && { width }),
    ...(showText && { 'show-text': true }),
  };
  const data = Object.keys(params).map((key) => `data-${key}="${params[key]}"`);
  return `<div class="fb-post" ${data.join(' ')}></div><script async defer src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v3.2"></script>`;
};

const facebook = (url) => {
  const pattern = /facebook\.com/i;
  if (!pattern.test(url)) return null; // not a facebook URL.

  const { href, host, searchParams } = new URL(url);

  if (/facebook\.com\/plugins\//i.test(url)) {
    // matches a plugin url, e.g. plugins/video.php plugins/post.php, etc
    if (!searchParams.has('href')) return '<div></div>'; // no `href` query param found. remove.
    // return facebook div element
    return buildFacebookElement({
      href: searchParams.get('href'),
      showText: searchParams.get('show_text') === 'true',
      // @todo determine if the requested width should be preserved
      // width: searchParams.get('width'),
    });
  }
  // after checking for facebook plugin URLs, treat all other facebook URLs as posts.
  if (!pattern.test(host)) return null; // facebook.com appears somewhere else in the URL.
  // return facebook div element
  return buildFacebookElement({ href, showText: true });
};

/**
 *
 */
module.exports = (url) => {
  // convert embeds, as they no longer support oembed without auth
  const fbPost = facebook(url);
  if (fbPost) return fbPost;
  return null;
};
