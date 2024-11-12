module.exports = ({ advertisingPost, preview }) => {
  const {
    _id: id,
    title,
    publishedDay,
    statusEdge,
    featuredImageEdge,
    companyEdge,
    ...rest
  } = advertisingPost || {};
  const { label } = statusEdge && statusEdge.node ? statusEdge.node : {};
  const isPublished = label === 'Published' && (new Date() >= new Date(publishedDay));
  if (id && (isPublished || preview)) {
    const { _id: imageId, src } = (featuredImageEdge && featuredImageEdge.node)
      ? featuredImageEdge.node
      : { src: { settings: {} } };
    const primaryImage = {
      id: imageId,
      src: src.url,
      focalPoint: {
        x: src.settings.fpX,
        y: src.settings.fpY,
      },
    };
    const { _id: companyId, name, logoEdge } = (companyEdge && companyEdge.node)
      ? companyEdge.node
      : { logoEdge: {} };
    const { _id: logoId, src: logoSrc } = (logoEdge && logoEdge.node)
      ? logoEdge.node
      : { src: { settings: {} } };
    const advertiser = {
      id: companyId,
      name,
      logo: {
        id: logoId,
        src: logoSrc.url,
        focalPoint: {
          x: logoSrc.settings.fpX,
          y: logoSrc.settings.fpY,
        },
      },
    };
    const story = {
      id,
      title: title.default,
      // ex: publishedDay is a string of format YYYY-MM-DD
      publishedAt: Number(new Date(publishedDay)),
      primaryImage,
      advertiser,
      ...rest,
    };
    return story;
  }
  return null;
};
