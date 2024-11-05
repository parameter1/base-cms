const { getAsObject } = require('@parameter1/base-cms-object-path');
const convertAdvertisingPostToNativeStory = require('./utils/convert-advertising-post-to-native-story');

class MindfulMarkoWebService {
  /**
 * @param {object} params
 * @param {import("../api-client.js").MindfulApiClient} params.client
 */
  constructor({ client }) {
    this.client = client;
    this.convertAdvertisingPostToNativeStory = convertAdvertisingPostToNativeStory;
  }

  /**
   * Get post by Id
   *
   * @param {string} externalId
   * @returns {Promise}
   */
  async getAdvertisingPostAsNativeStory({
    _id,
    preview,
    provider,
    tenant,
    type = 'story',
  }, fragment) {
    const response = await this.client.getAdvertisingPostByIdOrImportEntity({
      _id,
      preview,
      provider,
      tenant,
      type,
    }, fragment);
    const advertisingPost = getAsObject(response, 'data.advertisingPostByIdOrImportEntity');
    return this.convertAdvertisingPostToNativeStory({ advertisingPost, preview });
  }
}
module.exports = { MindfulMarkoWebService };
