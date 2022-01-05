const gql = require('graphql-tag');

module.exports = gql`

fragment ActiveUserFragment on AppUser {
  id
  email
  verified
  givenName
  familyName
  displayName
  organization
  organizationTitle
  countryCode
  regionCode
  postalCode
  receiveEmail
  mustReVerifyProfile
  externalIds {
    id
    identifier { value type }
    namespace { provider tenant type }
  }
  regionalConsentAnswers { id given date }
  customBooleanFieldAnswers(input: {
    onlyActive: true
    sort: { field: name, order: asc }
  }) {
    id
    field {
      id
      label
      active
      required
      externalId {
        id
        namespace { provider tenant type }
        identifier { value type }
      }
    }
    value
  }
  customSelectFieldAnswers(input: {
    onlyActive: true
    sort: { field: label, order: asc }
  }) {
    id
    hasAnswered
    answers { id externalIdentifier }
    field {
      id
      label
      active
      multiple
      required
      externalId {
        id
        namespace { provider tenant type }
        identifier { value type }
      }
      options { id label }
    }
  }
}

`;
