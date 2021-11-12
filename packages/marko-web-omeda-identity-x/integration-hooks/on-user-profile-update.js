module.exports = async ({
  idxOmedaRapidIdentifyProp = '$idxOmedaRapidIdentify',
  req,
  user,
}) => {
  const idxOmedaRapidIdentify = req[idxOmedaRapidIdentifyProp];
  if (!idxOmedaRapidIdentify) throw new Error(`Unable to find the IdentityX+Omeda rapid identifier on the request using ${idxOmedaRapidIdentifyProp}`);
  return idxOmedaRapidIdentify({ user });
};
