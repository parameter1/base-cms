const gql = require('graphql-tag');

const useLinkInjectedBody = process.env.USE_LINK_INJECTED_BODY === 'true';

module.exports = gql`
fragment ContentPageFragment on Content {
  id
  name
  teaser(input: { useFallback: false, maxLength: null })
  labels
  body(input: { useLinkInjectedBody: ${useLinkInjectedBody} })
  published
  updated
  siteContext {
    path
    canonicalUrl
  }
  company {
    id
    name
    canonicalPath
    enableRmi
  }
  primarySection {
    id
    name
    alias
    canonicalPath
    hierarchy {
      id
      name
      alias
      canonicalPath
    }
  }
  primaryImage {
    id
    src(input: { useCropRectangle: true, options: { auto: "format,compress" } })
    cropRectangle {
      width
      height
    }
    alt
    caption
    credit
    isLogo
    cropDimensions {
      aspectRatio
    }
    primaryImageDisplay
  }
  gating {
    surveyType
    surveyId
  }
  userRegistration {
    isCurrentlyRequired
    accessLevels
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
    ends
    starts
  }
  ... on SidebarEnabledInterface {
    sidebars: sidebarStubs {
      name
      body
      label
    }
  }
  ... on ContentWebinar {
    linkUrl
    starts
    startDate
    transcript
    sponsors {
      edges {
        node {
          id
          name
          canonicalPath
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
          body
          labels
          siteContext {
            path
          }
          primaryImage {
            id
            src(input: { options: { auto: "format,compress" } })
            alt(input: { append: "Headshot" })
          }
        }
      }
    }
  }
  images(input:{ pagination: { limit: 0 }, sort: { order: values } }) {
    edges {
      node {
        id
        src(input: { options: { auto: "format,compress" } })
        alt
        displayName
        caption
        credit
        inCarousel
        source {
          width
          height
        }
      }
    }
  }
}
`;
