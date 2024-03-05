// Currently setup to take and destructure req
module.exports = ({ query, cookies }) => {
  const getOmedaId = (value) => {
    if (!value) return null;
    const trimmed = `${value}`.trim();
    return /^[a-z0-9]{15}$/i.test(trimmed) ? trimmed : null;
  };
  const idFromQuery = getOmedaId(query.oly_enc_id);
  const idFromCookie = cookies.oly_enc_id ? getOmedaId(cookies.oly_enc_id.replace(/^"/, '').replace(/"$/, '')) : undefined;
  return Boolean(idFromQuery || idFromCookie);
};
