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
  city
  street
  addressExtra
  phoneNumber
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
    sort: { field: createdAt, order: asc }
  }) {
    id
    hasAnswered
    answer
    value
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
  }
  customSelectFieldAnswers(input: {
    onlyActive: true
    sort: { field: createdAt, order: asc }
  }) {
    id
    hasAnswered
    answers { id externalIdentifier writeInValue }
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
      options: choices {
        id
        label
        ... on SelectFieldOption {
          canWriteIn
        }
        ... on SelectFieldOptionGroup {
          options {
            id
            label
          }
        }
      }
    }
  }
}

`;
