const { getAsArray } = require('@parameter1/base-cms-object-path');
const resyncCookie = require('../utils/resync-cookie');
const getOmedaCustomerRecord = require('../utils/get-omeda-customer-record');
const getOmedaLinkedFields = require('../utils/get-omeda-linked-fields');
const setOmedaDemographics = require('../utils/set-omeda-demographics');
const setOmedaDeploymentTypes = require('../utils/set-omeda-deployment-types');
const findEncryptedId = require('../external-id/find-encrypted-customer-id');

/**
 * A middleware to resync the IdentityX user data with the Omeda customer data. After syncing data,
 * sets a cookie to prevent resyncs for the configured timeframe.
 */
module.exports = ({
  brandKey,
  omedaGraphQLClientProp = '$omedaGraphQLClient',
}) => async (req, res, next) => {
  const { identityX, [omedaGraphQLClientProp]: omedaGraphQLClient } = req;
  if (!omedaGraphQLClient) throw new Error(`Unable to load the Omeda GraphQL API from the request using prop ${omedaGraphQLClientProp}`);

  // Load the user and find their external ID
  const { user } = await req.identityX.loadActiveContext();
  const encryptedCustomerId = findEncryptedId({ externalIds: getAsArray(user, 'externalIds'), brandKey });

  // Only check for the cookie if we have a valid IdX user and Omeda customer
  if (user && encryptedCustomerId) {
    const cookie = resyncCookie.parseFrom(req);
    // If the cookie doesn't exist (or has expired), resync the user data
    if (encryptedCustomerId && !cookie) {
      // Load the customer data from Omeda and fields from IdentityX
      const [omedaCustomer, omedaLinkedFields] = await Promise.all([
        getOmedaCustomerRecord({ omedaGraphQLClient, encryptedCustomerId }),
        getOmedaLinkedFields({ identityX, brandKey }),
      ]);

      // Update the IdentityX user record custom select fields with the Omeda customer demographics
      await setOmedaDemographics({
        req,
        identityX,
        user,
        omedaCustomer,
        fields: omedaLinkedFields.demographic,
      });

      // Update the IdentityX user record custom boolean fields with the Omeda deployment opt-ins
      await setOmedaDeploymentTypes({
        identityX,
        user,
        omedaCustomer,
        fields: omedaLinkedFields.deploymentType,
      });

      // Set the cookie to prevent further resyncs until interval is reached.
      const value = { lastSync: Date.now() };
      const maxAge = identityX.config.get('userResyncInterval', 7 * 24 * 60 * 60 * 1000); // 1 week
      resyncCookie.setTo({ res, value, maxAge });
    }
  }
  next();
};
