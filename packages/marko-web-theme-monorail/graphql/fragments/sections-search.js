const gql = require('graphql-tag');

module.exports = gql`
fragment WebsiteSectionSearchFragment on WebsiteSection {
  id
  alias
  name
  children(input: { pagination: { limit: 0 } }) {
    edges {
      node {
        id
        alias
        name
        children(input: { pagination: { limit: 0 } }) {
          edges {
            node {
              id
              alias
              name
              children(input: { pagination: { limit: 0 } }) {
                edges {
                  node {
                    id
                    alias
                    name
                    children(input: { pagination: { limit: 0 } }) {
                      edges {
                        node {
                          id
                          alias
                          name
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

`;
