const gql = require('graphql-tag');

module.exports = gql`

interface SidebarEnabledInterface {
  sidebarStubs(input: ContentSidebarStubsInput = {}): [ContentStubSidebar!]! @projection(localField: "sidebars")
}

enum ContentSidebarSortField {
  name
  sequence
}

input ContentSidebarStubsInput {
  "Filters the sidebars by one or more labels. An empty value will return all sidebars"
  labels: [String!] = []
  sort: ContentSidebarSortInput = {}
  "Embedded image defaults to apply to inline images"
  imageAttrs: EmbeddedImageAttrsInput = {
    w: 1280,
    fit: "max",
    auto: "format,compress"
  }
}

input ContentSidebarSortInput {
  field: ContentSidebarSortField = sequence
  order: SortOrder = asc
}

`;
