module.exports = ({ query }, { input }) => {
  const { ids, includeContentTypes } = input;

  return {
    query: {
      ...query,
      ...(ids.length && { _id: { $in: ids } }),
      ...(includeContentTypes.length && { type: { $in: includeContentTypes } }),
    },
  };
};
