const { BaseDB } = require('@base-cms/db');
const { UserInputError } = require('apollo-server-express');
const { cleanPath } = require('@base-cms/utils');
const { content: canonicalPathFor } = require('@base-cms/canonical-path');
const { get } = require('@base-cms/object-path');
const { underscore, dasherize, titleize } = require('@base-cms/inflector');

const getProjection = require('../../utils/get-projection');
const formatStatus = require('../../utils/format-status');
const getEmbeddedImageTags = require('../../utils/embedded-image-tags');
const relatedContent = require('../../utils/related-content');
const inquiryEmails = require('../../utils/inquiry-emails');
const connectionProjection = require('../../utils/connection-projection');
const getDescendantIds = require('../../utils/website-section-child-ids');
const {
  createTitle,
  createDescription,
  getPublishedCriteria,
  getDefaultContentTypes,
} = require('../../utils/content');
const contentTeaser = require('../../utils/content-teaser');

const { isArray } = Array;

const resolveType = async ({ type }) => `Content${type}`;

const loadSection = async ({
  basedb,
  siteId,
  id,
  alias,
}) => {
  if (!id && !alias) return null;
  const sectionQuery = { status: 1 };
  if (siteId) sectionQuery['site.$id'] = siteId;
  if (alias) {
    sectionQuery.alias = alias;
  } else {
    sectionQuery._id = id;
  }
  return basedb.strictFindOne('website.Section', sectionQuery, { projection: { _id: 1 } });
};

const loadOption = async ({
  basedb,
  siteId,
  id,
  name,
}) => {
  if (!id && !name) return null;
  const optionQuery = { status: 1 };
  if (siteId) optionQuery['site.$id'] = siteId;
  if (id) {
    optionQuery._id = id;
  } else {
    optionQuery.name = name;
  }
  return basedb.strictFindOne('website.Option', optionQuery, { projection: { _id: 1 } });
};

const loadHomeSection = async ({
  basedb,
  siteId,
  status,
  projection,
}) => basedb.findOne('website.Section', {
  alias: 'home',
  ...formatStatus(status),
  ...(siteId && { 'site.$id': siteId }),
}, { projection });

const formatContentType = ({ type }, { input }) => {
  const { format } = input;
  switch (format) {
    case 'dasherize':
      return dasherize(type);
    case 'underscore':
      return underscore(type);
    case 'titleize':
      return titleize(type);
    default:
      return type;
  }
};

module.exports = {
  /**
   *
   */
  Addressable: {
    __resolveType: resolveType,
    cityStateZip: ({ city, state, zip }) => {
      let out = '';
      if (city && state) {
        out = `${city}, ${state}`;
      } else if (city) {
        out = `${city}`;
      } else if (state) {
        out = `${state}`;
      }
      if (zip) out = `${out} ${zip}`;
      return out || null;
    },
  },

  /**
   *
   */
  Authorable: { __resolveType: resolveType },

  /**
   *
   */
  Contactable: { __resolveType: resolveType },

  /**
   *
   */
  SocialLinkable: { __resolveType: resolveType },

  /**
   *
   */
  OrganizationContactable: { __resolveType: resolveType },

  /**
   *
   */
  Inquirable: {
    __resolveType: resolveType,
    inquiryEmails,
  },

  /**
   *
   */
  Media: {
    __resolveType: resolveType,
    fileSrc: ({ fileName, filePath }, _, { assetHost }) => {
      if (!fileName || !filePath) return null;
      return `https://${assetHost}/${cleanPath(filePath)}/${fileName}`;
    },
  },

  /**
   *
   */
  ContentMetadata: {
    title: content => createTitle(content),
    description: content => createDescription(content),
  },

  /**
   *
   */
  Content: {
    __resolveType: resolveType,

    canonicalUrl: async (content, _, { load, basedb, site }) => {
      const projection = { alias: 1, 'site.$id': 1 };

      const ref = BaseDB.get(content, 'mutations.Website.primarySection');
      const id = BaseDB.extractRefId(ref);
      const section = (id) ? await load('websiteSection', id, projection) : await loadHomeSection({
        basedb,
        siteId: site._id,
        status: 'active',
        projection,
      });

      const owningSiteId = BaseDB.extractRefId(section.site);
      const owningSite = await load('platformProduct', owningSiteId, { url: 1 }, { type: 'Site' });

      const origin = `https://${owningSite.url}`;
      const values = [
        section.alias,
        dasherize(content.type),
        content._id,
        get(content, 'mutations.Website.slug'),
      ];
      const path = cleanPath(values.filter(v => v).map(v => String(v).trim()).join('/'));
      return `${origin}/${cleanPath(path)}`;
    },

    /**
     * Load primary section of content.
     * If primary section's site matches the current site, return the section.
     * If not, check for alternative site + section (@todo).
     * Return alternate section (if found), otherwise return home section of current site.
     * If no site is provided, simply return the current section.
     */
    primarySection: async (content, { input }, { load, site, basedb }, info) => {
      const { status } = input;
      const {
        returnType,
        fieldNodes,
        schema,
        fragments,
      } = info;
      const projection = getProjection(schema, returnType, fieldNodes[0].selectionSet, fragments);

      const ref = BaseDB.get(content, 'mutations.Website.primarySection');
      const id = BaseDB.extractRefId(ref);
      if (!id) {
        // No primary section reference found. Load home section for current site.
        return loadHomeSection({
          basedb,
          siteId: site._id,
          status,
          projection,
        });
      }

      const query = {
        ...formatStatus(status),
        ...(site._id && { 'site.$id': site._id }),
      };
      const section = await load('websiteSection', id, projection, query);
      if (section) return section;

      // Current section does not match site, load alternate.
      // @todo This should eventually account for secondary sites/sections. For now, load home.
      return loadHomeSection({
        basedb,
        siteId: site._id,
        status,
        projection,
      });
    },

    shortName: (content) => {
      const shortName = get(content, 'shortName', '').trim();
      const mutatedName = get(content, 'mutations.Website.name', '').trim();
      if (shortName) return shortName;
      if (mutatedName) return mutatedName;
      return content.name;
    },

    teaser: (content, { input }) => {
      const { mutation } = input;
      const teaser = contentTeaser.getTeaser(mutation, content);
      const { teaserFallback } = content;
      return contentTeaser.generateTeaser(teaser, teaserFallback, input) || null;
    },

    body: async (content, { input }, { imageHost, basedb }) => {
      const { mutation } = input;
      const { body } = content;
      const mutated = get(content, `mutations.${mutation}.body`);

      let value = mutation ? mutated || body : body;
      // Convert image tags to include image attributes (src, alt, caption, credit).
      const imageTags = await getEmbeddedImageTags(value, { imageHost, basedb });
      imageTags.forEach((tag) => {
        const replacement = tag.isValid() ? tag.build() : '';
        value = value.replace(tag.getRegExp(), replacement);
      });
      return value;
    },

    userRegistration: (content) => {
      const requiresRegistration = get(content, 'mutations.Website.requiresRegistration');
      const requiresAccessLevels = get(content, 'mutations.Website.requiresAccessLevels');

      const userRegistration = {
        isRequired: Boolean(requiresRegistration),
        accessLevels: [],
      };

      if (!requiresRegistration) return userRegistration;
      if (isArray(requiresAccessLevels)) userRegistration.accessLevels = requiresAccessLevels;
      return userRegistration;
    },

    metadata: content => content,

    canonicalPath: (content, _, ctx) => canonicalPathFor(content, ctx),

    redirectTo: (content) => {
      const { type, linkUrl } = content;

      const types = ['Promotion', 'TextAd'];
      if (!types.includes(type)) return null;

      return linkUrl;
    },

    type: formatContentType,

    statusText: ({ status, published, unpublished }) => {
      const now = Date.now();
      switch (status) {
        case 0:
          return 'Deleted';
        case 1:
          if (published && published.valueOf() > now) return 'Scheduled';
          if (unpublished && unpublished < now) return 'Expired';
          if (published) return 'Published';
          return 'Unpublished';
        case 2:
          return 'Draft';
        default:
          return 'Unpublished';
      }
    },

    relatedContent: (doc, { input }, { basedb, site }, info) => {
      const {
        queryTypes,
      } = input;
      // If no query types were specified (owned, inverse, etc), return an empty response.
      if (!queryTypes.length) return BaseDB.paginateEmpty();

      // Run perform the related content query.
      return relatedContent.performQuery(doc, {
        siteId: site._id,
        input,
        basedb,
        info,
      });
    },
  },

  /**
   *
   */
  ContentArticle: {
    sidebars: ({ sidebars }) => {
      if (!isArray(sidebars)) return [];
      return sidebars.map(({ body } = {}) => body).filter(v => v);
    },
  },

  /**
   *
   */
  PublishedContentCount: {
    type: formatContentType,
  },

  /**
   *
   */
  ContentSitemapUrl: {
    loc: async (content, _, ctx) => {
      const path = await canonicalPathFor(content, ctx);
      return `${ctx.site.origin}${path}`;
    },
  },

  /**
   *
   */
  Query: {
    /**
     *
     */
    allPublishedContent: async (_, { input }, { basedb, site }, info) => {
      const {
        since,
        sectionId,
        contentTypes,
        requiresImage,
        sectionBubbling,
        sort,
        pagination,
        beginning,
        ending,
      } = input;

      const query = getPublishedCriteria({ since, contentTypes });

      if (site._id) query['mutations.Website.primarySite'] = site._id;

      if (beginning.before) query.$and.push({ startDate: { $lte: beginning.before } });
      if (beginning.after) query.$and.push({ startDate: { $gte: beginning.after } });
      if (ending.before) query.$and.push({ endDate: { $lte: ending.before } });
      if (ending.after) query.$and.push({ endDate: { $gte: ending.after } });

      if (requiresImage) {
        query.primaryImage = { $exists: true };
      }

      let sectionIds = sectionId;
      if (sectionId && sectionBubbling) {
        const descendantIds = await getDescendantIds(sectionId, basedb);
        if (descendantIds.length) {
          sectionIds = { $in: descendantIds };
        }
      }
      if (sectionIds) {
        query['mutations.Website.primarySection.$id'] = sectionIds;
      }

      const projection = connectionProjection(info);
      return basedb.paginate('platform.Content', {
        query,
        sort,
        projection,
        ...pagination,
      });
    },

    /**
     *
     */
    publishedContentCounts: async (_, { input }, { basedb, site }) => {
      const {
        since,
        includeContentTypes: contentTypes,
        excludeContentTypes,
      } = input;

      const $match = getPublishedCriteria({
        since,
        contentTypes,
        excludeContentTypes,
      });
      if (site._id) $match['mutations.Website.primarySite'] = site._id;

      const pipeline = [
        { $match },
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $project: { type: '$_id', count: 1 } },
      ];
      const results = await basedb.aggregate('platform.Content', pipeline);
      return results.toArray();
    },

    contentSitemapUrls: async (_, { input }, { basedb, site }) => {
      const {
        since,
        contentTypes,
        changefreq,
        priority,
        pagination,
      } = input;

      const query = getPublishedCriteria({ since, contentTypes, excludeContentTypes: ['Promotion', 'TextAd'] });

      if (site._id) query['mutations.Website.primarySite'] = site._id;

      const projection = {
        type: 1,
        'mutations.Website.slug': 1,
        'mutations.Website.primarySection': 1,
        updated: 1,
      };
      const sort = { updated: -1 };
      const { limit, skip } = pagination;
      const cursor = await basedb.find('platform.Content', query, {
        limit,
        skip,
        projection,
        sort,
      });
      const docs = [];
      await cursor.forEach((doc) => {
        docs.push({ ...doc, changefreq, priority });
      });
      return docs;
    },

    /**
     *
     */
    allAuthorContent: async (_, { input }, { basedb, site }, info) => {
      const {
        since,
        contactId,
        authorTypes,
        includeContentTypes,
        requiresImage,
        sort,
        pagination,
      } = input;

      if (!authorTypes.length) throw new UserInputError('At least one `authorType` must be provided.');

      const query = getPublishedCriteria({ since, contentTypes: includeContentTypes });

      if (site._id) query['mutations.Website.primarySite'] = site._id;
      query.$or = authorTypes.map((type) => {
        const field = `${type}s`;
        return { [field]: contactId };
      });

      if (requiresImage) {
        query.primaryImage = { $exists: true };
      }
      const projection = connectionProjection(info);
      return basedb.paginate('platform.Content', {
        query,
        sort,
        projection,
        ...pagination,
      });
    },

    /**
     *
     */
    allCompanyContent: async (_, { input }, { basedb, site }, info) => {
      const {
        since,
        companyId,
        includeContentTypes,
        requiresImage,
        sort,
        pagination,
      } = input;

      const query = getPublishedCriteria({ since, contentTypes: includeContentTypes });

      if (site._id) query['mutations.Website.primarySite'] = site._id;
      query.$or = [
        { company: companyId },
        { 'relatedTo.$id': companyId },
      ];

      if (requiresImage) {
        query.primaryImage = { $exists: true };
      }
      const projection = connectionProjection(info);
      return basedb.paginate('platform.Content', {
        query,
        sort,
        projection,
        ...pagination,
      });
    },

    /**
     * @todo add content publishing fields to magaazine schedules
     */
    magazineScheduledContent: async (_, { input }, { basedb }, info) => {
      const {
        issueId,
        sectionId,
        excludeContentIds,
        includeContentTypes: contentTypes,
        requiresImage,
        pagination,
      } = input;

      const since = new Date();
      const idQuery = {
        issue: issueId,
      };
      if (sectionId) idQuery.section = sectionId;

      const ids = await basedb.distinct('magazine.Schedule', 'content.$id', idQuery);

      const query = getPublishedCriteria({ excludeContentIds, contentTypes, since });
      query.$and.push({ _id: { $in: ids } });

      if (requiresImage) query.primaryImage = { $exists: true };

      const projection = connectionProjection(info);
      return basedb.paginate('platform.Content', {
        query,
        projection,
        sort: { field: 'published', order: 'desc' },
        ...pagination,
      });
    },

    /**
     * Retrieves expiring (or expired) website scheduled content.
     *
     * Date range examples (a before or after _must_ be provided):
     *
     * - Expiring/expired between Aug 1 and Aug 31: `before: Aug 31` and `after: Aug 1`
     * - Expiring/expired after Aug 31: `after: Aug 31`
     * - Expiring/expire before Aug 1: `before: Aug 1`
     *
     */
    websiteExpiringContent: async (_, { input }, { basedb, site }, info) => {
      const {
        before,
        after,
        sectionId,
        optionId,
        excludeContentIds,
        excludeSectionIds,
        includeContentTypes,
        excludeContentTypes,
        pagination,
      } = input;

      if (!sectionId && !optionId) throw new UserInputError('Either a sectionId or optionId input must be provided.');
      if (!before && !after) throw new UserInputError('Either a sectionId or optionId input must be provided.');

      const siteId = site._id;
      const [section, option] = await Promise.all([
        loadSection({
          basedb,
          siteId,
          id: sectionId,
        }),
        loadOption({
          basedb,
          siteId,
          id: optionId,
          name: 'Standard',
        }),
      ]);

      const $elemMatch = {
        optionId: option._id,
        $and: [],
      };
      if (before) $elemMatch.$and.push({ end: { $lte: before } });
      if (after) $elemMatch.$and.push({ end: { $gte: after } });
      if (section) $elemMatch.sectionId = section._id;
      if (excludeSectionIds.length) {
        $elemMatch.$and.push({ sectionId: { $nin: excludeSectionIds } });
      }

      const query = { sectionQuery: { $elemMatch } };

      if (includeContentTypes.length) {
        if (!isArray(query.$and)) query.$and = [];
        query.$and.push({ type: { $in: includeContentTypes } });
      } else {
        if (!isArray(query.$and)) query.$and = [];
        query.$and.push({ type: { $in: getDefaultContentTypes() } });
      }
      if (excludeContentTypes.length) {
        if (!isArray(query.$and)) query.$and = [];
        query.$and.push({ type: { $nin: excludeContentTypes } });
      }
      if (excludeContentIds.length) {
        query._id = { $nin: excludeContentIds };
      }

      const projection = connectionProjection(info);
      return basedb.paginate('platform.Content', {
        query,
        sort: { field: 'sectionQuery.0.end', order: 'desc' },
        projection: { 'sectionQuery.$.end': 1, ...projection },
        excludeProjection: ['sectionQuery.end'],
        ...pagination,
      });
    },

    /**
     *
     */
    websiteScheduledContent: async (_, { input }, { basedb, site }, info) => {
      const {
        sectionId,
        sectionAlias,
        optionId,
        excludeContentIds,
        excludeSectionIds,
        includeContentTypes,
        excludeContentTypes,
        requiresImage,
        sectionBubbling,
        pagination,
      } = input;

      if (!sectionId && !sectionAlias) throw new UserInputError('Either a sectionId or sectionAlias input must be provided.');
      if (sectionId && sectionAlias) throw new UserInputError('You cannot provided both a sectionId and sectionAlias as input.');

      const siteId = site._id;
      const [section, option] = await Promise.all([
        loadSection({
          basedb,
          siteId,
          id: sectionId,
          alias: sectionAlias,
        }),
        loadOption({
          basedb,
          siteId,
          id: optionId,
          name: 'Standard',
        }),
      ]);

      const descendantIds = await sectionBubbling ? getDescendantIds(section._id, basedb) : [];

      const now = new Date();
      const $elemMatch = {
        sectionId: descendantIds.length ? { $in: descendantIds } : section._id,
        optionId: option._id,
        start: { $lte: now },
        $and: [
          {
            $or: [
              { end: { $gt: now } },
              { end: { $exists: false } },
            ],
          },
        ],
      };

      if (excludeSectionIds.length) {
        $elemMatch.$and.push({ sectionId: { $nin: excludeSectionIds } });
      }
      const query = { sectionQuery: { $elemMatch } };
      if (requiresImage) {
        query.primaryImage = { $exists: true };
      }
      if (includeContentTypes.length) {
        if (!isArray(query.$and)) query.$and = [];
        query.$and.push({ type: { $in: includeContentTypes } });
      } else {
        if (!isArray(query.$and)) query.$and = [];
        query.$and.push({ type: { $in: getDefaultContentTypes() } });
      }
      if (excludeContentTypes.length) {
        if (!isArray(query.$and)) query.$and = [];
        query.$and.push({ type: { $nin: excludeContentTypes } });
      }
      if (excludeContentIds.length) {
        query._id = { $nin: excludeContentIds };
      }

      const projection = connectionProjection(info);
      return basedb.paginate('platform.Content', {
        query,
        sort: { field: 'sectionQuery.0.start', order: 'desc' },
        projection: { 'sectionQuery.$.start': 1, ...projection },
        excludeProjection: ['sectionQuery.start'],
        ...pagination,
      });
    },

    /**
     *
     */
    relatedPublishedContent: async (_, { input }, { basedb, site }, info) => {
      const {
        contentId,
        queryTypes,
      } = input;
      // If no query types were specified (owned, inverse, etc), return an empty response.
      if (!queryTypes.length) return BaseDB.paginateEmpty();

      // Retrieve the content document.
      const doc = await basedb.findById('platform.Content', contentId, {
        projection: { _id: 1, relatedTo: 1, 'mutations.Website.primarySection': 1 },
      });

      // If no content document was found, return an empty response.
      if (!doc) return BaseDB.paginateEmpty();

      // Run perform the related content query.
      return relatedContent.performQuery(doc, {
        siteId: site._id,
        input,
        basedb,
        info,
      });
    },
  },
};
