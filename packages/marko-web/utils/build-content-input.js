module.exports = ({ req, contentIdStatusExceptions }) => {
  const input = {};
  if (req.cookies['preview-mode']
    || req.query['preview-mode']
    || contentIdStatusExceptions.includes(Number(req.params.id))
  ) {
    input.status = 'any';
  } else {
    input.since = Date.now();
  }
  return input;
};
