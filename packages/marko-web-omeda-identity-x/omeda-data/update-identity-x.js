const setOmedaData = require('./set-omeda-data');
const setOmedaDemographics = require('./set-omeda-demographics');
const setOmedaDeploymentTypes = require('./set-omeda-deployment-types');
const setOmedaProducts = require('./set-omeda-products');

/**
 * Provides a standard interface to update IdentityX user data from Omeda. All updates to IdX user
 * data should run through this utility.
 *
 * @note These updates should NEVER be run concurrently, to prevent a race condition in the IdX API.
 *
 * @param {object} args Arguments to pass along to update utilities
 * @param {object} flags Keys indicate which updates should be executed.
 * @param {object} flags.updateData            If true, update the root fields (first/last name,etc)
 * @param {object} flags.updateDemographics    If true, update custom select fields
 * @param {object} flags.updateDeploymentTypes If true, update boolean `deploymentType` fields
 * @param {object} flags.updateProducts        If true, update boolean `product` fields
 */
module.exports = async (
  {
    identityX,
    brandKey,
    user,
    omedaCustomer,
    omedaLinkedFields = {},
  } = {},
  {
    updateData = false,
    updateDemographics = false,
    updateDeploymentTypes = false,
    updateProducts = false,
  } = {},
) => {
  if (updateData) {
    await setOmedaData({
      identityX,
      user,
      omedaCustomer,
    });
  }
  if (updateDemographics) {
    await setOmedaDemographics({
      identityX,
      brandKey,
      user,
      omedaCustomer,
      fields: omedaLinkedFields.demographic,
    });
  }
  if (updateDeploymentTypes) {
    await setOmedaDeploymentTypes({
      identityX,
      brandKey,
      user,
      omedaCustomer,
      fields: omedaLinkedFields.deploymentType,
    });
  }
  if (updateProducts) {
    await setOmedaProducts({
      identityX,
      brandKey,
      user,
      omedaCustomer,
      fields: omedaLinkedFields.product,
    });
  }
};
