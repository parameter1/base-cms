const { get, getAsArray, getAsObject } = require('@parameter1/base-cms-object-path');
const { validateYoutubePlaylistId, validateYoutubeChannelId, validateYoutubeUsername } = require('../../utils/youtube');

module.exports = {
  /**
   *
   */
  YoutubePlaylistConnection: {
    totalCount: response => get(response, 'pageInfo.totalResults', 0),
    pageInfo: response => ({
      hasNextPage: Boolean(get(response, 'nextPageToken')),
      endCursor: get(response, 'nextPageToken'),
    }),
    edges: response => getAsArray(response, 'items'),
  },

  /**
   *
   */
  YoutubePlaylistEdge: {
    node: edge => getAsObject(edge, 'snippet'),
    cursor: edge => get(edge, 'id'),
  },

  /**
   *
   */
  YoutubeVideo: {
    id: snippet => get(snippet, 'resourceId.videoId'),
    url: snippet => `https://youtu.be/${get(snippet, 'resourceId.videoId')}`,
    published: snippet => new Date(get(snippet, 'publishedAt')),
    thumbnail: (snippet, { input = {} }) => {
      const url = get(snippet, `thumbnails.${input.size}.url`, get(snippet, 'thumbnails.default.url'));
      // private/unlisted videos will not return a thumbnail. return a default icon instead.
      return url || 'https://i.ytimg.com/vi//hqdefault.jpg';
    },
  },

  /**
   *
   */
  Query: {
    /**
     *
     */
    validateYoutubePlaylistId: (_, { input }) => {
      const { playlistId } = input;
      return validateYoutubePlaylistId(playlistId);
    },
    validateYoutubeChannelId: (_, { input }) => {
      const { channelId } = input;
      return validateYoutubeChannelId(channelId);
    },
    validateYoutubeUsername: (_, { input }) => {
      const { username } = input;
      return validateYoutubeUsername(username);
    },
  },
};
