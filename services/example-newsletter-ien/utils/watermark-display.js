const { buildImgixUrl } = require('@parameter1/base-cms-image');

module.exports = ({
  node,
  newsletter,
  markWidth: w,
  markHeight: h,
  markImgUrl,
}) => {
  if (!['video'].includes(node.type)) return {};
  const waterMarkImg = markImgUrl || `https://${newsletter.site.imageHost}/files/base/indm/all/image/static/play-sign-white-50.png`;
  const waterMarkOptions = { auto: 'format', h, w };
  return { mark: buildImgixUrl(waterMarkImg, waterMarkOptions), markalign: 'center,middle' };
};
