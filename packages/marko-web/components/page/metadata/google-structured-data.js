const { get, getAsArray } = require('@parameter1/base-cms-object-path');

const getSD = (o, path) => {
  const v = get(o, path);
  return (v == null) ? undefined : v;
};

const getAuthor = (node) => {
  const authors = getAsArray(node, 'authors.edges').map(e => get(e, 'node.name'));
  if (authors.length > 0) {
    const author = {
      '@type': 'Person',
      name: authors.join(', '),
    };
    return author;
  }
  return undefined;
};

const getImages = (node) => {
  const images = getAsArray(node, 'images.edges').map(e => get(e, 'node.src'));
  return (images.length > 0) ? images : undefined;
};

module.exports = (node) => {
  const publishedISOString = node.published ? (new Date(node.published)).toISOString() : undefined;
  const updatedISOString = node.updated ? (new Date(node.updated)).toISOString() : undefined;
  if (node.type === 'video') {
    const structuredData = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: getSD(node, 'metadata.title'),
      description: getSD(node, 'metadata.description'),
      thumbnailUrl: getSD(node, 'metadata.image.src'),
      uploadDate: publishedISOString,
      contentUrl: getSD(node, 'siteContext.canonicalUrl'),
      author: getAuthor(node),
      embedUrl: getSD(node, 'embedSrc'),
    });
    return structuredData;
  }

  const newsArticleTypes = ['article', 'news'];
  if (newsArticleTypes.includes(node.type)) {
    const structuredData = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': getSD(node, 'siteContext.canonicalUrl'),
      },
      headline: getSD(node, 'metadata.title'),
      image: getImages(node),
      datePublished: publishedISOString,
      dateModified: updatedISOString,
      author: getAuthor(node),
      description: getSD(node, 'metadata.description'),
    });
    return structuredData;
  }

  return undefined;
};
