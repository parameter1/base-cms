const gql = require('graphql-tag');

const factory = ({ useLinkInjectedBody = false } = {}) => {
  const fragment = gql`

  fragment ContentPageFragment on Content {
    id
    name
    teaser(input: { useFallback: false, maxLength: null })
    body(input: { useLinkInjectedBody: ${useLinkInjectedBody} })
    published
    labels
    siteContext {
      path
      canonicalUrl
      url
    }
    company {
      id
      name
      siteContext {
        path
      }
      enableRmi
      primaryImage {
        id
        src(input: { options: { auto: "format,compress" } })
        alt
        caption
        credit
        isLogo
      }
    }
    primarySection {
      id
      name
      fullName
      alias
      canonicalPath
      hierarchy {
        id
        name
        alias
        canonicalPath
        logo {
          id
          src(input: { options: { auto: "format,compress" } })
        }
      }
    }
    primaryImage {
      id
      src(input: { options: { auto: "format,compress" } })
      alt
      caption
      credit
      isLogo
    }
    gating {
      surveyType
      surveyId
    }
    userRegistration {
      bypassGating
      isCurrentlyRequired
      accessLevels
    }
    createdBy {
      id
      username
      firstName
      lastName
    }
    ... on ContentVideo {
      embedCode
      transcript
    }
    ... on ContentPodcast {
      transcript
    }
    ... on ContentNews {
      source
      byline
    }
    ... on ContentEvent {
      endDate
      startDate
    }
    ... on ContentArticle {
      sidebars
    }
    ... on ContentWebinar {
      linkUrl
      startDate
      transcript
      sponsors {
        edges {
          node {
            id
            name
            siteContext {
              path
            }
          }
        }
      }
    }
    ... on Addressable {
      address1
      address2
      cityStateZip
      country
    }
    ... on Contactable {
      phone
      tollfree
      fax
      website
      title
      mobile
      publicEmail
    }
    ... on ContentCompany {
      email
    }
    ... on SocialLinkable {
      socialLinks {
        provider
        url
        label
      }
    }
    ... on Media {
      fileSrc
    }
    ... on Inquirable {
      enableRmi
    }
    ... on Authorable {
      authors {
        edges {
          node {
            id
            name
            type
            siteContext {
              path
            }
          }
        }
      }
      contributors {
        edges {
          node {
            id
            name
            type
            siteContext {
              path
            }
          }
        }
      }
      photographers {
        edges {
          node {
            id
            name
            type
            siteContext {
              path
            }
          }
        }
      }
    }
    images(input: { pagination: { limit: 100 }, sort: { order: values } }) {
      edges {
        node {
          id
          src(input: { options: { auto: "format,compress" } })
          alt
          source {
            width
            height
          }
          displayName
          caption
          credit
          isLogo
        }
      }
    }
    taxonomy {
      edges {
        node {
          id
          name
        }
      }
    }
  }
  `;
  fragment.factory = factory;
  return fragment;
};

module.exports = factory();
