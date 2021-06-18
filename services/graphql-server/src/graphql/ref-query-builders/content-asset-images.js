module.exports = (doc, { query }, { input }) => {
  const q = { ...query };
  const { approvedForWeb, approvedForPrint } = input;
  if (approvedForWeb != null) q['mutations.Website.approved'] = approvedForWeb;
  if (approvedForPrint != null) q['mutations.Magazine.approved'] = approvedForPrint;
  return { query: q };
};
