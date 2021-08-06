const getId = (value) => {
  if (!value) return null;
  const trimmed = `${value}`.trim();
  return /^[a-z0-9]{15}$/i.test(trimmed) ? trimmed : null;
};

module.exports = (req) => {
  const { query, cookies } = req;
  const idFromQuery = getId(query.oly_enc_id);
  if (idFromQuery) return idFromQuery;
  if (!cookies.oly_enc_id) return null;
  return getId(cookies.oly_enc_id.replace(/^"/, '').replace(/"$/, ''));
};
