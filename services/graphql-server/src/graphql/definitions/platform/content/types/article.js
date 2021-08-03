const gql = require('graphql-tag');

module.exports = gql`

extend type Query {
  contentArticle(input: ContentArticleQueryInput!): ContentArticle @findOne(model: "platform.Content", using: { id: "_id" }, criteria: "contentArticle")
}

type ContentArticle implements Content & Authorable & SidebarEnabledInterface @applyInterfaceFields {
  # fields directly on platform.model::Content\Article
  sidebars: [String]! @deprecated(reason: "Sidebars now support multiple fields. Use \`ContentArticle.sidebarStubs\` instead.") @projection
}

type ContentArticleConnection {
  totalCount: Int!
  edges: [ContentArticleEdge]!
  pageInfo: PageInfo!
}

type ContentArticleEdge {
  node: ContentArticle!
  cursor: String!
}

input ContentArticleQueryInput {
  id: Int!
  status: ModelStatus = active
}

input ContentArticleSortInput {
  field: ContentSortField = id
  order: SortOrder = desc
}

`;
