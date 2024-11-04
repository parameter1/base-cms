const convertAdvertisingPostToNativeStory = require(('./utils/convert-advertising-post-to-native-story'));

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
  async getAdvertisingPostById({ _id }, fragment) {
    const post = await this.client.getAdvertisingPostById({ _id }, fragment);
    return post;
  }

  /**
   * Get post by Id
   *
   * @param {string} externalId
   * @returns {Promise}
   */
  async getAdvertisingPostByIdOrImportEntity({ _id, provider, tenant, type = 'story' }, fragment) {
    const post = await this.client.getAdvertisingPostByIdOrImportEntity({ _id, provider, tenant, type }, fragment);
    return post;
  }


}
module.exports = { MindfulMarkoWebService };
