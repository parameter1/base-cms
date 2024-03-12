const gql = require('./gql');

const buildLabelFragment = (labels = {}) => {
  const fields = Object.keys(labels || {}).map((key) => {
    const field = labels[key];
    return `${key}: ${field.multiple ? 'multipleLabelValues' : 'singleLabelValue'}(labelId: "${field._id}")`;
  });
  if (!fields.length) return '';
  const out = gql`
  fragment NativeEmailAdDeliveryLabelFragment on NativeEmailAdvertisingCreative {
    _id
    ${fields.join('\n    ')}
  }
  `;
  return out;
};

/**
 * @template {Object<string,MindfulLabel>} MindfulLabelDefinition
 * @typedef MindfulLabel
 * @prop {boolean} multiple
 * @prop {string} _id
 *
 * @param {MindfulLabelDefinition[]}
 * @returns {string}
 */
module.exports = (labels = {}) => {
  const labelFragment = buildLabelFragment(labels);
  return gql`
  query MarkoNewsletterDeliverNativeEmailAdCreatives(
    $adUnitId: ObjectID!
    $day: Date!
    $limit: Int = 1
    $featuredImageSettings: AdvertisingImageRenderingSettingsInput = {
      # @todo verify, override defaults?
      auto: [COMPRESS, FORMAT]
    }
    $logoImageSettings: AdvertisingImageRenderingSettingsInput = {
      # @todo verify, override defaults?
      auto: [COMPRESS, FORMAT]
      fit: FILLMAX
      fill: SOLID
    }
  ) {
    deliverNativeEmailAdvertisingCreatives(
      advertisingUnitId: $adUnitId
      day: $day
      limit: $limit
    ) {
      creative {
        ...NativeEmailAdDeliveryFragment
        ${labelFragment ? '...NativeEmailAdDeliveryLabelFragment' : ''}
      }
    }
  }

  fragment NativeEmailAdDeliveryFragment on NativeEmailAdvertisingCreative {
    _id
    name { default }

    clickUrl
    linkText # CTA

    title
    teaser

    imageEdge {
      _id
      node { ...FeaturedImageNodeFragment }
    }

    companyEdge {
      _id
      node {
        _id
        name { default }
        logoEdge { _id node { ...LogoImageNodeFragment } }
      }
    }
  }

  fragment FeaturedImageNodeFragment on AdvertisingImage {
    _id
    alt
    caption
    credit
    src(renderingSettings: $featuredImageSettings) { url }
  }

  fragment LogoImageNodeFragment on AdvertisingImage {
    _id
    alt
    caption
    credit
    src(renderingSettings: $logoImageSettings) { url }
  }

  ${labelFragment || ''}
`;
};
