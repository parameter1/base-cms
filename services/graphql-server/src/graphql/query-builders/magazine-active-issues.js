module.exports = ({ query }, { input }) => {
  const q = { ...query };

  const {
    publicationId,
    excludeIssueIds,
    requiresCoverImage,
    mailing,
  } = input;

  const $and = [];
  $and.push({ mailDate: { $lte: mailing.before ? mailing.before : new Date() } });
  if (mailing.after) $and.push({ mailDate: { $gte: mailing.after } });
  q.$and = $and;
  q['publication.$id'] = publicationId;
  if (excludeIssueIds.length) q._id = { $nin: excludeIssueIds };
  if (requiresCoverImage) q['coverImage.$id'] = { $exists: true };

  return { query: q };
};
