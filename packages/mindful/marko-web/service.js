class MindfulMarkoWebService {
  /**
 * @param {object} params
 * @param {import("../api-client.js").MindfulApiClient} params.client
 */
  constructor({ client }) { this.client = client; }

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
    return this.client.getAdvertisingPostAsNativeStory({
      _id,
      preview,
      provider,
      tenant,
      type,
    }, fragment);
  }
}
module.exports = { MindfulMarkoWebService };
