const objectPath = require('@parameter1/base-cms-object-path');

const { getAsArray } = objectPath;

const get = (o, path) => {
  const v = objectPath.get(o, path);
  return v == null ? undefined : v;
};

const getAuthor = (node) => {
  const authors = getAsArray(node, 'authors.edges').map(e => get(e, 'node.name'));
  return authors.length ? { '@type': 'Person', name: authors.join(', ') } : undefined;
};

const getImages = (node) => {
  const images = getAsArray(node, 'images.edges').map(e => get(e, 'node.src'));
  return images.length ? images : undefined;
};

module.exports = (node, customMetadata = {}) => {
  const publishedISOString = node.published ? (new Date(node.published)).toISOString() : undefined;
  const updatedISOString = node.updated ? (new Date(node.updated)).toISOString() : undefined;
  if (node.type === 'video') {
    const structuredData = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: get(node, 'metadata.title'),
      description: get(node, 'metadata.description'),
      thumbnailUrl: get(node, 'metadata.image.src'),
      uploadDate: publishedISOString,
      contentUrl: get(node, 'siteContext.canonicalUrl'),
      author: getAuthor(node),
      embedUrl: get(node, 'embedSrc'),
      ...customMetadata,
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
        '@id': get(node, 'siteContext.canonicalUrl'),
      },
      headline: get(node, 'metadata.title'),
      image: getImages(node),
      datePublished: publishedISOString,
      dateModified: updatedISOString,
      author: getAuthor(node),
      description: get(node, 'metadata.description'),
      ...customMetadata,
    });
    return structuredData;
  }

  const standardArticleTypes = ['product', 'blog'];
  if (standardArticleTypes.includes(node.type)) {
    const structuredData = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': get(node, 'siteContext.canonicalUrl'),
      },
      headline: get(node, 'metadata.title'),
      image: getImages(node),
      datePublished: publishedISOString,
      dateModified: updatedISOString,
      author: getAuthor(node),
      description: get(node, 'metadata.description'),
    });
    return structuredData;
  }

  return undefined;
};
