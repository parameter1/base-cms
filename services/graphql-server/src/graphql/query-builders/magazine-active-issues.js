module.exports = ({ query }, { input }) => {
  const q = { ...query };

  const {
    publicationId,
    excludeIssueIds,
    requiresCoverImage,
    mailing,
  } = input;

  q.mailDate = { $lte: new Date() };
  const $and = [];
  if (mailing.before) $and.push({ mailDate: { $lte: mailing.before } });
  if (mailing.after) $and.push({ mailDate: { $gte: mailing.after } });
  if ($and) q.$and = $and;
  q['publication.$id'] = publicationId;
  if (excludeIssueIds.length) q._id = { $nin: excludeIssueIds };
  if (requiresCoverImage) q['coverImage.$id'] = { $exists: true };

  return { query: q };
};
