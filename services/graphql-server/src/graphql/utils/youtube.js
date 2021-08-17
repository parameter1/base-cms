const { getAsArray } = require('@parameter1/base-cms-object-path');
const googleDataApiClient = require('../../google-data-api-client');

module.exports = {
  /**
   *
   */
  validateYoutubePlaylistId: async (playlistId) => {
    if (!playlistId) return false;
    try {
      const response = await googleDataApiClient.request('youtube.playlistList', { part: 'id', id: playlistId });
      return getAsArray(response, 'items').length > 0;
    } catch (e) {
      if (e.statusCode === 404) return false;
      throw e;
    }
  },
  validateYoutubeChannelId: async (channelId) => {
    if (!channelId) return false;
    try {
      const response = await googleDataApiClient.request('youtube.channelList', { part: 'id', id: channelId });
      return getAsArray(response, 'items').length > 0;
    } catch (e) {
      if (e.statusCode === 404) return false;
      throw e;
    }
  },
  validateYoutubeUsername: async (username) => {
    if (!username) return false;
    try {
      const response = await googleDataApiClient.request('youtube.channelList', { part: 'id', forUsername: username });
      return getAsArray(response, 'items').length > 0;
    } catch (e) {
      if (e.statusCode === 404) return false;
      throw e;
    }
  },
};
