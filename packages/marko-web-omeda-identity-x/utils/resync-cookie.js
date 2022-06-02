const COOKIE_NAME = '__idx_omeda_sync';
const defaultMaxAge = 7 * 24 * 60 * 60 * 1000; // 1 week

const parseFrom = (req) => {
  try {
    return JSON.parse(req.cookies[COOKIE_NAME]);
  } catch (e) {
    return false;
  }
};

const setTo = ({
  res,
  value,
  maxAge = defaultMaxAge,
}) => {
  const v = JSON.stringify(value);
  res.cookie(COOKIE_NAME, v, { maxAge, httpOnly: false });
  return true;
};

module.exports = {
  parseFrom,
  setTo,
};
