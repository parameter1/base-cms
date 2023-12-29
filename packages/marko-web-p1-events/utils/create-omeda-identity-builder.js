module.exports = (brandKey) => `
  function cleanOlyticsId(value) {
    if (!value) return null;
    var cleaned = value.replace(/"/g, '');
    if (cleaned === 'null') return null;
    return /^[A-Z0-9]{15}$/.test(cleaned) ? cleaned : null;
  }

  var incomingId = cleanOlyticsId(query.oly_enc_id);
  var currentId = cleanOlyticsId(cookies.oly_enc_id);
  var id = incomingId || currentId;
  if (id) return 'omeda.${brandKey}.customer*' + id + '~encrypted';
`;
