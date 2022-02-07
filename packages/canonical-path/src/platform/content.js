const { isFunction: isFn, cleanPath } = require('@parameter1/base-cms-utils');
const { get, getAsArray } = require('@parameter1/base-cms-object-path');
const { BaseDB } = require('@parameter1/base-cms-db');
const { dasherize } = require('@parameter1/base-cms-inflector');

const pathResolvers = {
  id: content => content._id,
  slug: content => get(content, 'mutations.Website.slug'),
  type: content => dasherize(content.type),
  sectionAlias: async (content, { load, site }) => {
    const ref = BaseDB.get(content, 'mutations.Website.primarySection');
    const id = BaseDB.extractRefId(ref);
    if (!id) return 'home'; // No primary section. Load home.

    // Attempt to load section for the current site.
    const query = {
      status: 1,
      'site.$id': site.id(),
    };
    const section = await load('websiteSection', id, { alias: 1 }, query);
    if (section) return section.alias;
    // @todo This should eventually account for secondary sites/sections.
    // For now load an alternate from schedules
    const sectionQuery = getAsArray(content, 'sectionQuery');
    if (sectionQuery.length) {
      const currentSiteSections = sectionQuery.map((schedule) => {
        if (schedule.siteId === site.id()) return schedule;
        return null;
      }).filter(v => v);
      if (currentSiteSections.length) {
        const currentSiteSection = await load('websiteSection', currentSiteSections[0].sectionId, { alias: 1 }, query);
        if (currentSiteSection) return currentSiteSection.alias;
      }
    }
    // If the requested alternate could not be found.
    return 'home';
  },
  primaryCategoryPath: async (content, { load }) => {
    const ref = BaseDB.get(content, 'mutations.Website.primaryCategory');
    const id = BaseDB.extractRefId(ref);
    if (!id) return '';

    // Load category and extract path.
    const query = { status: 1, type: 'Category' };
    const category = await load('platformTaxonomy', id, { 'mutations.Website.urlPath': 1 }, query);
    return cleanPath(BaseDB.get(category, 'mutations.Website.urlPath'));
  },
};

const dynamicPageResolvers = {
  alias: content => get(content, 'mutations.Website.alias'),
};

const handleDynamicPage = async (content, context) => {
  const { canonicalRules } = context;
  const { dynamicPage: pageRules } = canonicalRules;
  const { parts, prefix } = pageRules;

  const values = await Promise.all(parts.map((key) => {
    const fn = dynamicPageResolvers[key];
    return isFn(fn) ? fn(content, context) : content[key];
  }));

  const path = cleanPath(values.filter(v => v).map(v => String(v).trim()).join('/'));

  if (!path) return '';
  if (prefix) return `/${cleanPath(prefix)}/page/${path}`;
  return `/page/${path}`;
};

/**
 *
 * @param {object} content The content object
 * @param {object} context The canonical path context (including rules, etc)
 * @param {object} [options]
 * @param {boolean} [options.enableLinkUrl=true] Whether to use the `linkUrl` field, if present.
 */
module.exports = async (content, context, { enableLinkUrl = true } = {}) => {
  const { canonicalRules } = context;
  const { content: contentRules } = canonicalRules;
  const { parts, prefix } = contentRules;
  const { type, linkUrl } = content;

  if (type === 'Page') return handleDynamicPage(content, context);

  const types = ['Promotion', 'TextAd'];
  if (enableLinkUrl && types.includes(type) && linkUrl) return linkUrl;

  const values = await Promise.all(parts.map((key) => {
    const fn = pathResolvers[key];
    return isFn(fn) ? fn(content, context) : content[key];
  }));

  const path = cleanPath(values.filter(v => v).map(v => String(v).trim()).join('/'));

  if (!path) return '';
  if (prefix) return `/${cleanPath(prefix)}/${path}`;
  return `/${path}`;
};
