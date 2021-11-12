module.exports = async ({
  idxOmedaRapidIdentifyProp = '$idxOmedaRapidIdentify',
  req,
  user,
}) => {
  const idxRapidIdentify = req[idxOmedaRapidIdentifyProp];
  if (!idxRapidIdentify) throw new Error(`Unable to find the IdentityX+Omeda rapid identifier on the request using ${idxOmedaRapidIdentifyProp}`);
  return idxRapidIdentify({ user });
};
