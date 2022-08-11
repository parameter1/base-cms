const { get } = require('@parameter1/base-cms-object-path');

const getBehavior = (event, behaviors) => {
  switch (event) {
    case 'onLoginLinkSent':
      return behaviors.logIn;
    case 'onAuthenticationSuccess':
      return behaviors.verifyEmail;
    case 'onUserProfileUpdate':
      return behaviors.submitProfile;
    default:
      return undefined;
  }
};

const buildAttributes = (attrs, data) => Object.keys(attrs).reduce((arr, key) => {
  const attr = attrs[key];
  const valueId = get(attrs, `${key}.valueIds.${data[key]}`, attr.valueId);
  if (!valueId) return arr;
  return [...arr, { id: attr.id, valueId }];
}, []);

/**
 * Returns an Omeda Behavior ID and attribute map for the supplied IdentityX event data.
 * @returns Object|undefined
 */
module.exports = ({ behaviors, behaviorAttributes }) => (event, data) => {
  const behaviorId = getBehavior(event, behaviors);
  if (!behaviorId) return undefined;
  const attributes = buildAttributes(behaviorAttributes, data);
  return { id: behaviorId, attributes };
};
