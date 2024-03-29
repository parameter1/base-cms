import gql from '../parse';

export default gql`

query LeadersContentTaxonomyIds($contentId: Int!) {
  content(input: { id: $contentId }) {
    id
    taxonomy(input: { type: Category, pagination: { limit: 0 } }) {
      edges {
        node {
          id
        }
      }
    }
    primarySection {
      id
    }
    websiteSchedules {
      section {
        id
      }
    }
  }
}

`;
