import gql from '../parse';

export default gql`

query ContentForLeadersSection(
  $sectionId: Int!,
  $promotionLimit: Int = 4,
  $videoLimit: Int = 3,
  $includeContentTypes: [ContentType!] = [Company]
) {
  websiteScheduledContent(input: {
    sectionId: $sectionId,
    pagination: { limit: 0 },
    sort: { field: name, order: asc },
    sectionBubbling: false,
    includeContentTypes: $includeContentTypes
  }) {
    edges {
      node {
        id
        name
        siteContext {
          path
        }
        ... on SocialLinkable {
          socialLinks {
            provider
          }
        }
        primaryImage{
          id
          src(input: {
            options: {
              auto: "format",
              fillColor: "fff",
              fit: "fill",
              bg: "fff",
              pad: 20,
              h: 200,
              w: 200,
              borderRadius: "200,200,200,200",
              border: "10,fff",
            },
          })
        }
        ... on ContentCompany {
          productUrls: externalLinks(input: { keys: ["company-products"] }) {
            url
          }
          productSummary
          publicContacts(input: { pagination: { limit: 1 } }) {
            edges {
              node {
                id
                name
                title
                primaryImage {
                  id
                  src(input: {
                    options: {
                      auto: "format",
                      h: 100,
                      w: 100,
                      mask: "ellipse",
                      fit: "facearea",
                      facepad: 3
                    }
                  })
                }
              }
            }
          }
          teaser(input: { useFallback: false, maxLength: null })
          website
          promotions: relatedContent(input: {
            withSite: false,
            queryTypes: [company],
            includeContentTypes: [Promotion],
            pagination: { limit: $promotionLimit },
          }) {
            edges {
              node {
                id
                name
                primaryImage{
                  id
                  src(input: {
                    options: {
                      auto: "format",
                      fit: "crop",
                      h: 180,
                      w: 240,
                    }
                  })
                  alt
                  isLogo
                }
                ... on ContentPromotion {
                  linkUrl
                  linkText
                }
              }
            }
          }
          youtube {
            username
            channelId
            url
          }
          videos: youtubeVideos(input: { pagination: { limit: $videoLimit } }) {
            edges {
              node {
                id
                url
                title
                thumbnail(input: { size: medium })
              }
            }
          }
          relatedVideos: relatedContent(input: {
            withSite: false,
            queryTypes: [company],
            includeContentTypes: [Video],
            pagination: { limit: $videoLimit },
          }) {
            edges {
              node {
                id
                name
                primaryImage{
                  id
                  src(input: {
                    options: {
                      auto: "format",
                      fit: "crop",
                      h: 180,
                      w: 240,
                    }
                  })
                  alt
                  isLogo
                }
                canonicalPath
              }
            }
          }
        }
      }
    }
  }
}
`;
