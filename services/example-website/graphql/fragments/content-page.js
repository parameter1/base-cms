const gql = require('graphql-tag');

module.exports = gql`
fragment ContentPageFragment on Content {
  id
  name
  teaser(input: { useFallback: false, maxLength: null })
  body
  published
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
