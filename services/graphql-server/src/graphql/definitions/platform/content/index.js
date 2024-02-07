const gql = require('graphql-tag');
const interfaces = require('./interfaces');
const types = require('./types');

module.exports = gql`

extend type Query {
  content(input: ContentQueryInput = {}): Content @findOne(
    model: "platform.Content",
    using: { id: "_id" },
    criteria: "content",
    queryBuilder: "publishedContent",
    withSite: false, # allow content to always load, regardless of site context.
  )
  # load content from custom alias
  contentAlias(input: ContentAliasQueryInput = {}): Content @findOne(
    model: "platform.Content",
    using: { alias: "mutations.Website.alias" },
    criteria: "content",
    queryBuilder: "publishedContent",
    withSite: false, # allow content to always load, regardless of site context.
  )
  contentHash(input: ContentHashQueryInput = {}): Content @findOne(
    model: "platform.Content",
    using: { hash: "hash" },
    criteria: "content",
    withSite: false, # allow content to always load, regardless of site context.
  )
  allContent(input: AllContentQueryInput = {}): ContentConnection! @findMany(
    model: "platform.Content",
    criteria: "content",
    queryBuilder: "allContent",
    withSite: false, # allow content to always load, regardless of site context.
  )
  "Returns all published content items matching the supplied criteria."
  allPublishedContent(input: AllPublishedContentQueryInput = {}): ContentConnection!
  allPublishedContentDates(input: AllPublishedContentDatesQueryInput = {}): [PublishedContentDate!]!
  publishedContentCounts(input: PublishedContentCountsQueryInput = {}): [PublishedContentCount!]!
  contentSitemapUrls(input: ContentSitemapUrlsQueryInput = {}): [ContentSitemapUrl!]!
  contentSitemapNewsUrls(input: ContentSitemapNewsUrlsQueryInput = {}): [ContentSitemapNewsUrl!]!
  allAuthorContent(input: AllAuthorContentQueryInput = {}): ContentConnection!
  allCompanyContent(input: AllCompanyContentQueryInput = {}): ContentConnection!
  magazineScheduledContent(input: MagazineScheduledContentQueryInput = {}): ContentConnection!
  websiteScheduledContent(input: WebsiteScheduledContentQueryInput = {}): WebsiteScheduledContentConnection!
  newsletterScheduledContent(input: NewsletterScheduledContentQueryInput = {}): [Content!]!
  relatedPublishedContent(input: RelatedPublishedContentQueryInput = {}): ContentConnection!
  websiteExpiringContent(input: WebsiteExpiringContentQueryInput = {}): ContentConnection!

  mostPopularContent(input: QueryMostPopularContentInput! = {}): QueryMostPopularContentConnection!
}

extend type Mutation {
  "Creates a new Content item"
  createContent(input: CreateContentMutationInput!): Content! @requiresAuth
  "Updates address fields on a Content item"
  contentAddressFields(input: ContentAddressFieldsMutationInput!): Content! @requiresAuth
  "Updates contact fields on a Content item"
  contentContactFields(input: ContentContactFieldsMutationInput!): Content! @requiresAuth
  "Changes the publishing state of a Content item"
  contentPublishing(input: ContentPublishingMutationInput!): Content! @requiresAuth
  "Sets the Content body"
  contentBody(input: ContentBodyMutationInput!): Content! @requiresAuth
  "Sets the Content teaser"
  contentTeaser(input: ContentTeaserMutationInput!): Content! @requiresAuth
  "Sets a Content custom attribute"
  contentCustomAttribute(input: ContentCustomAttributeMutationInput!): Content! @requiresAuth
  "Sets the dates for a ContentEvent item"
  contentEventDates(input: ContentEventDatesMutationInput!): ContentEvent! @requiresAuth
  "Sets the Content name"
  contentName(input: ContentNameMutationInput!): Content! @requiresAuth
  "Sets the Content User Registration"
  contentUserRegistration(input: ContentUserRegistrationMutationInput!): Content! @requiresAuth
  "Sets the Content company field"
  contentCompanyField(input: ContentCompanyFieldMutationInput!): Content! @requiresAuth
  "Updates the content taxonomy field"
  contentTaxonomy(input: ContentTaxonomyMutationInput!): Content! @requiresAuth
  "Updates the content SEO Title field"
  contentSEOTitle(input: ContentSEOTitleMutationInput!): Content! @requiresAuth
}

enum GateableUserRole {
  ROLE_REGISTERED
}

enum GateableSurveyProvider {
  wufoo
  idme
  app_form_com
  idx
  alchemer
  formcms
}

enum ContentMutation {
  Email
  Magazine
  Website
}

enum ContentType {
  Apparatus
  Article
  Blog
  Collection
  Company
  Contact
  Document
  Ebook
  EngineSpec
  Event
  Group
  InQuarters
  Infographic
  Job
  MediaGallery
  News
  Page
  Podcast
  PressRelease
  Product
  Promotion
  Review
  Space
  Sponsored
  Supplier
  TextAd
  Top100
  TopList
  Video
  Venue
  Webinar
  Whitepaper
}

enum ContentTypeFormat {
  standard
  dasherize
  underscore
  titleize
}

enum PublishedContentDateFormatEnum {
  years
  months
  days
}

# NOTE: these fields must be properly indexed (with the correct collation)
# otherwise sorted queries will be **slow** (5ms vs 500ms slow).
# Generally speaking the index for each field would be:
# createIndex({ [field]: 1, _id: 1 }, { collation: { locale: 'en_US } })
enum ContentSortField {
  id
  name
  created
  updated
  published
  startDate
  endDate
}

enum ContentPathField {
  id
  type
  slug
  sectionAlias
}

enum ContentAuthorType {
  author
  contributor
  photographer
}

enum RelatedContentQueryType {
  # returns related content from doc.relatedTo
  owned
  # returns related content on the inverse of doc.relatedTo
  inverse
  # returns related content based on primary section
  primarySection
  # returns related content based on inverse company and relatedTo
  company
}

type ContentStubSidebar {
  body(input: ContentStubSidebarBodyInput = {}): String
  name: String
  label: String
  sequence: Int!
}

type ContentGating {
  requiredRole: GateableUserRole
  surveyType: GateableSurveyProvider
  surveyId: String
}

type ContentUserRegistration {
  bypassGating: Boolean!
  isRequired: Boolean!
  isCurrentlyRequired: Boolean!
  startDate: Date
  endDate: Date
  siteIds: [ObjectID!]!
  sites: [WebsiteSite!]!
  accessLevels: [String]!
}

type ContentConnection @projectUsing(type: "Content") {
  totalCount: Int!
  edges: [ContentEdge]!
  pageInfo: PageInfo!
}

type WebsiteScheduledContentConnection @projectUsing(type: "Content") {
  totalCount: Int!
  edges: [ContentEdge]!
  section: WebsiteSection @refOne(localField: "sectionId", loader: "websiteSection")
  pageInfo: PageInfo!
}

type ContentEdge {
  node: Content!
  cursor: String!
}

# Note: any required projections must be set at the root "metadata" field
type ContentMetadata {
  title: String
  description: String
  publishedDate(input: FormatDate = {}): String @momentFormat(localField: "published")
  updatedDate(input: FormatDate = {}): String @momentFormat(localField: "updated")
  expiresDate(input: FormatDate = {}): String @momentFormat(localField: "unpublished")
  image: AssetImage @refOne(localField: "primaryImage", loader: "platformAsset", criteria: "assetImage")
}

type ContentSiteContext {
  url: String!
  canonicalUrl: String!
  path: String!
  noIndex: Boolean!
}

type ContentStubLocation {
  latitude: Float
  longitude: Float
}

type ContentWebsiteSchedule {
  section: WebsiteSection @refOne(loader: "websiteSection", localField: "sectionId")
  option: WebsiteOption @refOne(loader: "websiteOption", localField: "optionId")
  start: Date
  startDate(input: FormatDate = {}): String @momentFormat(localField: "start")
  end: Date
  endDate(input: FormatDate = {}): String @momentFormat(localField: "end")
}

type MostPopularContent {
  id: Int!
  uniqueUsers: Int!
  views: Int!
  content: Content! @refOne(localField: "content._id", loader: "platformContent")
}

type PublishedContentCount {
  id: String! @value(localField: "_id")
  type(input: ContentTypeInput = {}): String!
  count: Int!
}

type PublishedContentDate {
  id: String!
  year: Int!
  month: Int
  day: Int
  count: Int!
}

type ContentEstimatedReadingTime {
  text: String!
  minutes: Float!
  time: Int!
  words: Int!
}

type ContentSitemapUrl {
  id: String! @value(localField: "_id")
  loc: String!
  lastmod: Date @value(localField: "updated")
  changefreq: SitemapChangeFreq!
  priority: Float!
  images: [ContentSitemapImage!]!
}

type ContentSitemapNewsUrl {
  id: String! @value(localField: "_id")
  loc: String!
  title: String!
  publication: ContentSitemapNewsPublication!
  published: Date
  images: [ContentSitemapImage!]!
}

type ContentSitemapNewsPublication {
  id: ObjectID! @value(localField: "_id")
  name: String!
  language: String!
}

type ContentSitemapImage {
  id: String @value(localField: "_id")
  loc: String!
  caption: String
  title: String
}

type QueryMostPopularContentConnection {
  startsAt: Date
  endsAt: Date
  updatedAt: Date
  edges: [QueryMostPopularContentEdge!]!
}

type QueryMostPopularContentEdge {
  node: MostPopularContent!
}

input ContentStubSidebarBodyInput {
  "Embedded image defaults to apply to inline images"
  imageAttrs: EmbeddedImageAttrsInput = {
    w: 1280,
    fit: "max",
    auto: "format,compress"
  }
}

input ContentQueryInput {
  siteId: ObjectID
  status: ModelStatus = active
  id: Int!
  since: Date
}

input ContentExternalLinksInput {
  keys: [String]
}

input ContentAliasQueryInput {
  siteId: ObjectID
  status: ModelStatus = active
  alias: String!
  since: Date
}

input ContentHashQueryInput {
  siteId: ObjectID
  status: ModelStatus = active
  hash: String!
}

input ContentSiteContextInput {
  "Determines whether to use the \`content.linkUrl\` field for generating paths and URLs. If \`false\`, the \`linkUrl\` will be ignored."
  enableLinkUrl: Boolean = true
}

input ContentSitemapUrlsQueryInput {
  siteId: ObjectID
  since: Date
  contentTypes: [ContentType!]!
  changefreq: SitemapChangeFreq = weekly
  priority: Float = 0.5
  pagination: PaginationInput = { limit: 100 }
}

input ContentSitemapNewsUrlsQueryInput {
  siteId: ObjectID
  includeContentTypes: [ContentType!] = [News, PressRelease, Blog]
  excludeContentTypes: [ContentType!] = []
  days: Int = 2
  taxonomyIds: [Int!] = []
  includeLabels: [String!] = []
  excludeLabels: [String!] = []
}

input CreateContentMutationInput {
  "The type of content to create"
  type: ContentType!
  "The name of the content"
  name: String!
  "The primary section of this content item"
  primarySectionId: Int!
}

"Addressable fields to update on content items"
input ContentAddressFieldsMutationInput {
  "The content ID"
  id: Int!
  "The primary address field (number, street, direction)"
  address1: String
  "The secondary address field (suite number, etc)"
  address2: String
  "The city"
  city: String
  "The state or region"
  state: String
  "The ZIP or postal code"
  zip: String
  "The country name"
  country: String
}

"Contactable fields to update on content items"
input ContentContactFieldsMutationInput {
  "The content ID"
  id: Int!
  "The primary telephone number"
  phone: String
  "The toll-free telephone number"
  tollfree: String
  "The fax telephone number"
  fax: String
  "The mobile telephone number"
  mobile: String
  "The website"
  website: String
  "The email address"
  email: String
  "The first name of the Contact"
  firstName: String
  "The last name of the Contact"
  lastName: String
  "The title of the Contact"
  title: String
  "The public email address"
  publicEmail: String
}

input ContentPublishingMutationInput {
  "The content ID"
  id: Int!
  "The status to change the content to"
  status: ModelStatus!
  "The date the content should become available"
  published: Date
  "The date the content should become unavailable"
  unpublished: Date
}

input ContentNameMutationInput {
  "The content ID"
  id: Int!
  "The name of the content. This is required and only mutated values can be removed with an empty string."
  value: String!
  "The mutation to target. The default/non-mutated value will be used when this is null or unset."
  mutation: ContentMutation
}

input ContentBodyMutationInput {
  "The content ID"
  id: Int!
  "The body text for the content. To remove, pass an empty string."
  value: String!
  "The mutation to target. The default/non-mutated value will be used when this is null or unset."
  mutation: ContentMutation
}

input ContentTeaserMutationInput {
  "The content ID"
  id: Int!
  "The teaser/intro text for the content. To remove, pass an empty string."
  value: String!
  "The mutation to target. The default/non-mutated value will be used when this is null or unset."
  mutation: ContentMutation
}

input ContentCustomAttributeMutationInput {
  "The content ID"
  id: Int!
  "The path (key) of the custom attribute to modify"
  path: String!
  "The value to set to the custom attribute. To remove a value, pass an empty string"
  value: String!
}

input ContentEventDatesMutationInput {
  "The content ID"
  id: Int!
  "The date the event starts"
  startDate: Date
  "The date the event ends"
  endDate: Date
  "If true, the times are ignored from startDate and endDate."
  allDay: Boolean = false
}

input ContentUserRegistrationMutationInput {
  "The content ID"
  id: Int!
  "Whether registration is required to access content"
  isRequired: Boolean!
  "The date when the registration requirement begins"
  startDate: Date
  "The date when the registration requirement ends"
  endDate: Date
}

input ContentTaxonomyMutationInput {
  "The content ID"
  id: Int!
  "The taxonomy IDs to add to this content item"
  addIds: [Int!]! = []
  "The taxonomy IDs to remove from this content item"
  removeIds: [Int!] = []
}

input AllPublishedContentQueryInput {
  "Limits results to content with a primary site matching the current site context "
  withSite: Boolean = true
  "A websiteSite identifier. If present, overrides the current site context."
  siteId: ObjectID
  "Limit results to items published after this date."
  after: Date
  "Limit results to items published before this date."
  since: Date
  "Limit results to items with this primary section id."
  sectionId: Int
  "Deprecated. Use includeContentTypes instead."
  contentTypes: [ContentType!] = []
  "Limit results to items matching specific custom attribute key value pairs"
  customAttributes: [ContentCustomAttributeQueryInput!] = []
  "Limit results to items matching at least one of these types."
  includeContentTypes: [ContentType!] = []
  "Limit results to items matching none of these types."
  excludeContentTypes: [ContentType!] = []
  "Limit results to items matching none of these ids."
  excludeContentIds: [Int!] = []
  "Limit results to items having at least one of these labels."
  excludeLabels: [String!]! = []
  "Limit results to items that have at least one of these taxonomy ids."
  includeTaxonomyIds: [Int!] = []
  "Limit results to items matching at least one of these labels."
  includeLabels: [String!]! = []
  "Limit results to items that have a primary image."
  requiresImage: Boolean = false
  "Include child sections when limiting by primary section id."
  sectionBubbling: Boolean = true
  "Adjusts the order items are returned in."
  sort: ContentSortInput = { field: published, order: desc }
  "Whether or not the content needs to be indexed by a search engine"
  requiresIndexed: Boolean = false
  "Adjust which subset of results should be returned."
  pagination: PaginationInput = {}
  "For types with a startDate field: Limit results to items with a startDate matching the criteria."
  beginning: ContentBeginningInput = {}
  "For types with a endDate field: Limit results to items with a endDate matching the criteria."
  ending: ContentEndingInput = {}
  "Limit results using the updated (modified) date."
  updated: ContentUpdatedInput = {}
  "Whether the query should be optimized for RSS."
  rssOptimized: Boolean
}

input AllPublishedContentDatesQueryInput {
  withSite: Boolean = true
  siteId: ObjectID
  after: String
  before: String
  format: PublishedContentDateFormatEnum = years
}

input PublishedContentCountsQueryInput {
  siteId: ObjectID
  after: Date
  since: Date
  excludeContentTypes: [ContentType!] = []
  includeContentTypes: [ContentType!] = []
}

input AllAuthorContentQueryInput {
  siteId: ObjectID
  contactId: Int!
  since: Date
  authorTypes: [ContentAuthorType!] = [author, contributor, photographer]
  includeContentTypes: [ContentType!] = []
  requiresImage: Boolean = false
  sort: ContentSortInput = { field: published, order: desc }
  pagination: PaginationInput = {}
  withSite: Boolean = true
}

input AllCompanyContentQueryInput {
  siteId: ObjectID
  companyId: Int!
  since: Date
  includeContentTypes: [ContentType!] = []
  excludeContentTypes: [ContentType!] = []
  includeLabels: [String!] = []
  excludeLabels: [String!] = []
  excludeContentIds: [Int!] = []
  requiresImage: Boolean = false
  sort: ContentSortInput = { field: published, order: desc }
  pagination: PaginationInput = {}
  withSite: Boolean = true
}

input ContentUpdatedInput {
  "If specified, include items updated before this date"
  before: Date
  "If specified, include items updated after this date"
  after: Date
}

input ContentBeginningInput {
  before: Date
  after: Date
}

input ContentEndingInput {
  before: Date
  after: Date
}

input ContentCustomAttributeInput {
  "The custom attribute field path."
  path: String!
}

input ContentCustomAttributeQueryInput {
  "The object property key to query against"
  key: String!
  "The value of that property key to query against"
  value: String!
  "Whether or not value exists"
  exists: Boolean
  "Whether or not to use RegEx over exact match"
  useRegEx: Boolean = false
}

input AllContentQueryInput {
  siteId: ObjectID
  status: ModelStatus = active
  "Content IDs to filter by. An empty value (default) returns all content."
  ids: [Int!] = []
  includeContentTypes: [ContentType!] = []
  sort: ContentSortInput = {}
  pagination: PaginationInput = {}
}

input MagazineScheduledContentQueryInput {
  issueId: Int!
  sectionId: Int
  excludeContentIds: [Int!] = []
  excludeSectionIds: [Int!] = []
  includeSectionNames: [String!] = []
  excludeSectionNames: [String!] = []
  excludeContentTypes: [ContentType!] = []
  includeContentTypes: [ContentType!] = []
  requiresImage: Boolean = false
  pagination: PaginationInput = {}
}

input WebsiteExpiringContentQueryInput {
  siteId: ObjectID
  before: Date
  after: Date
  sectionId: Int
  optionId: [Int] = []
  excludeContentIds: [Int!] = []
  excludeSectionIds: [Int!] = []
  excludeContentTypes: [ContentType!] = []
  includeContentTypes: [ContentType!] = []
  pagination: PaginationInput = {}
}

input NewsletterScheduledContentQueryInput {
  newsletterId: ObjectID!
  sectionId: Int
  sectionName: String
  date: Date!
  timezone: String
  ignoreStartDate: Boolean = false
  excludeContentTypes: [ContentType!] = []
  includeContentTypes: [ContentType!] = []
  limit: Int
  skip: Int
}

input WebsiteScheduledContentQueryInput {
  siteId: ObjectID
  sectionId: Int
  sectionAlias: String
  optionId: [Int] = []
  optionName: [String] = []
  excludeContentIds: [Int!] = []
  excludeSectionIds: [Int!] = []
  excludeContentTypes: [ContentType!] = []
  includeContentIds: [Int!] = []
  includeContentTypes: [ContentType!] = []
  includeLabels: [String!]! = []
  excludeLabels: [String!]! = []
  requiresImage: Boolean = false
  useOptionFallback: Boolean = false
  sectionBubbling: Boolean = true
  pagination: PaginationInput = {}
  sort: ContentSortInput = { field: null }
  after: Date
  since: Date
  "For types with a startDate field: Limit results to items with a startDate matching the criteria."
  beginning: ContentBeginningInput = {}
  "For types with a endDate field: Limit results to items with a endDate matching the criteria."
  ending: ContentEndingInput = {}
  "Limit results using the updated (modified) date."
  updated: ContentUpdatedInput = {}
  "Whether the query should be optimized for RSS."
  rssOptimized: Boolean
}

input RelatedPublishedContentQueryInput {
  withSite: Boolean = true
  siteId: ObjectID
  contentId: Int!
  excludeContentTypes: [ContentType!] = []
  includeContentTypes: [ContentType!] = []
  requiresImage: Boolean = false
  queryTypes: [RelatedContentQueryType!] = [owned, inverse]
  pagination: PaginationInput = {}
}

input ContentEstimatedReadingTimeInput {
  mutation: ContentMutation = Website
  wordsPerMinute: Int = 200
}

input ContentRelatedContentInput {
  withSite: Boolean = true
  siteId: ObjectID
  excludeContentTypes: [ContentType!] = []
  includeContentTypes: [ContentType!] = []
  requiresImage: Boolean = false
  queryTypes: [RelatedContentQueryType!] = [owned, inverse]
  pagination: PaginationInput = {}
}

input ContentMutationInput {
  mutation: ContentMutation = Website
}

input ContentTeaserInput {
  mutation: ContentMutation = Website
  useFallback: Boolean = true
  minLength: Int = 75
  maxLength: Int = 125
  truncatedSuffix: String = "..."
}

input ContentBodyInput {
  mutation: ContentMutation = Website
  imageAttrs: EmbeddedImageAttrsInput = {
    w: 1280,
    fit: "max",
    auto: "format,compress"
  }
  useLinkInjectedBody: Boolean = false
}

input EmbeddedImageAttrsInput {
  "The width of the embedded image"
  w: Int
  "The Imgix 'fit' parameter"
  fit: String
  "The Imgix 'auto' parameter"
  auto: String
}

input ContentTaxonomyInput {
  status: ModelStatus = active
  type: TaxonomyType
  sort: TaxonomySortInput = {}
  pagination: PaginationInput = {}
}

input ContentRelatedToInput {
  status: ModelStatus = active
  sort: ContentSortInput = {}
  pagination: PaginationInput = {}
}

input ContentCompanyInput {
  status: ModelStatus = active
}

input ContentImagesInput {
  approvedForWeb: Boolean = true
  approvedForPrint: Boolean
  sort: AssetImageSortInput = { order: values }
  pagination: PaginationInput = {}
}

input ContentPrimarySiteInput {
  status: ModelStatus = active
}

input ContentPrimarySectionInput {
  siteId: ObjectID
  status: ModelStatus = active
}

input ContentTypeInput {
  format: ContentTypeFormat = dasherize
}

input ContentSortInput {
  field: ContentSortField = id
  order: SortOrder = desc
}

input ContentHasWebsiteScheduleInput {
  siteId: ObjectID
  sectionId: Int
  sectionAlias: String
  optionId: [Int] = []
  optionName: [String] = []
  sectionBubbling: Boolean = true
}

input QueryMostPopularContentInput {
  siteId: ObjectID
  limit: Int! = 10
}

input ContentCompanyFieldMutationInput {
  "The content ID"
  id: Int!
  "The company ID, allows for 'nulling out' of company (removing a related company) if set to null or not present"
  companyId: Int
}

input ContentSEOTitleMutationInput {
  "The content ID"
  id: Int!
  "The SEO Title for the content"
  value: String!
}

${interfaces}
${types}

`;
