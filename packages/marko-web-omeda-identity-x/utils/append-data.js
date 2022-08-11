/**
 * Returns the Omeda behaviors, demographics, or promo codes that should be appended to the API call
 * based on the supplied event hook.
 */
module.exports = ({
  behaviors = [],
  demographics = [],
  promoCodes = [],
}) => (hookName) => {
  const appendBehaviors = behaviors
    .filter(({ hook }) => hook === hookName)
    .map(({ hook, ...rest }) => rest);
  const appendDemographics = demographics
    .filter(({ hook }) => hook === hookName)
    .map(({ hook, ...rest }) => rest);
  const appendPromoCodes = promoCodes
    .filter(({ hook }) => hook === hookName)
    .map(({ hook, ...rest }) => rest);
  return {
    ...(appendBehaviors.length && { appendBehaviors }),
    ...(appendDemographics.length && { appendDemographics }),
    ...(appendPromoCodes.length && { appendPromoCodes }),
  };
};
