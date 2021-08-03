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
  sort: ContentSidebarSortInput = {}
}

input ContentSidebarSortInput {
  field: ContentSidebarSortField = sequence
  order: SortOrder = asc
}

`;
