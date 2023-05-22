import gql from '../parse';

const fragment = gql`
fragment DownloadRelatedContentFragment on Content {
  id
  type
  name
  siteContext { path }
  primaryImage {
    id
    src(input: { options: { auto: "format,compress" } })
    alt
  }
  company {
    id
    name
    siteContext { path }
  }
  ...on Media {
    fileSrc
  }
}
`;

export default gql`
query DownloadRelatedAllPublishedContent ($input: AllPublishedContentQueryInput!) {
  allPublishedContent(input: $input) {
    totalCount
    edges {
      node {
        ...DownloadRelatedContentFragment
      }
    }
  }
}

${fragment}
`;
