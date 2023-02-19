const { buildImgixUrl } = require('@parameter1/base-cms-image');
const cheerio = require('cheerio');
const { URL, URLSearchParams } = require('url');

const supportedUrl = (src) => /vimeo\.com|youtu\.be|youtube\.com/.test(src);

const autoplayUrl = (src) => {
  const url = new URL(src);
  const searchParams = new URLSearchParams(url.search);
  searchParams.set('autoplay', 1);
  url.search = searchParams;
  return `${url}`;
};

module.exports = (content) => {
  if (!content.embedCode) return content;
  const { embedCode } = content;
  const $ = cheerio.load(embedCode, {}, false);
  $('iframe').each(function fn() {
    const src = $(this).attr('src');
    if (supportedUrl(src)) {
      const primaryImageSrc = buildImgixUrl(content.primaryImage.src, { w: 700, auto: 'format,compress' });
      const autoplaySrc = autoplayUrl(src);
      const spanStyle = "span{position:absolute;top: 50%;left:50%;width:70px;height:70px;content:'';background-image:url('data:image/png;base64,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');filter:brightness(0) invert(1) drop-shadow(2px 2px 2px rgba(0, 0, 0, .5));background-size:contain;opacity:1;transform:translate(-50%, -50%);}";
      const srcdoc = `<style>*{padding:0;margin:0;overflow:hidden}html,body{height:100%}${spanStyle}img{position:absolute;width:100%;top:0;bottom:0;margin:auto}</style><a href='${autoplaySrc}'><img src='${primaryImageSrc}' alt='${content.name}'><span></span></a>`;
      $(this).attr('srcdoc', srcdoc);
    }
  });
  const iframeContent = {
    ...content,
    embedCode: $.html(),
  };
  return iframeContent;
};
