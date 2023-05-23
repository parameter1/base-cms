module.exports = {
  title: 'Foo',
  anonymousCta: 'Register on P1 Sandbox to download this document, gain access to premium content, and more.',
  authenticatedCta: 'Fill out the form below to download this document.',
  fieldRows: [
    [
      {
        label: 'First Name',
        key: 'givenName',
        type: 'built-in',
        required: true,
        width: 0.5,
      },
      {
        label: 'Last Name',
        key: 'familyName',
        type: 'built-in',
        required: true,
        width: 0.5,
      },
    ],
    // Row 2
    [
      {
        label: 'Email Address',
        key: 'email',
        type: 'built-in',
        required: true,
        width: 0.5,
      },
      {
        label: 'Company Name',
        key: 'organization',
        type: 'built-in',
        required: true,
        width: 0.5,
      },
    ],
    // Row 3
    [
      {
        label: 'Custom 1',
        id: '618ab74dcd3e2f0147386c42',
        type: 'custom-select',
        required: true,
        width: 0.66,
      },
      {
        label: 'Custom 2',
        id: '626fe8854e597205b368a50f',
        type: 'custom-select',
        required: true,
        width: 0.33,
      },
    ],
    // Row 4
    [
      {
        label: 'Phone Number',
        key: 'phoneNumber',
        type: 'built-in',
        required: true,
        width: 0.25,
      },
      {
        label: 'Country',
        key: 'countryCode',
        type: 'built-in',
        required: true,
        width: 0.25,
      },
      {
        label: 'State/Province',
        key: 'regionCode',
        type: 'built-in',
        required: false,
        width: 0.25,
      },
      {
        label: 'ZIP Code',
        key: 'postalCode',
        type: 'built-in',
        required: false,
        width: 0.25,
      },
    ],
  ],
};
