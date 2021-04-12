const gql = require('graphql-tag');

module.exports = gql`

fragment ActiveUserFragment on AppUser {
  id
  email
  givenName
  familyName
  displayName
  organization
  organizationTitle
  countryCode
  regionCode
  postalCode
  receiveEmail
  externalIds {
    id
    identifier {
      value
      type
    }
    namespace {
      provider
      tenant
      type
    }
  }
  regionalConsentAnswers {
    id
    given
    date
  }
  customSelectFieldAnswers(input: {
    onlyActive: true
    sort: { field: label, order: asc }
  }) {
    id
    hasAnswered
    answers {
      id
    }
    field {
      id
      label
      multiple
      required
      options {
        id
        label
      }
    }
  }
}

`;
