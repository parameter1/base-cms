const pretty = require('pretty');
const cleanChunk = require('../utils/clean-chunk');
const buildGlobal = require('../utils/build-global');

module.exports = ({ enabled = true, prettyQueryParam = 'pretty', prettyEnvVar = 'MARKO_PRETTY_OUTPUT' } = {}) => (req, res, next) => {
  if (!enabled || !res.marko) return next();
  if (res.locals.cleanMarkoResponseApplied) return next();

  res.locals.cleanMarkoResponseApplied = true;
  const { write } = res;
  const prettyOutput = process.env[prettyEnvVar]
    || Object.hasOwnProperty.call(req.query, prettyQueryParam);

  if (prettyOutput) {
    res.marko = function output(template, data) {
      if (typeof template === 'string') {
        throw new Error('The Marko template cannot be a string.');
      }
      const $global = buildGlobal(this, data);
      const d = { ...(data || {}), $global };
      this.set({ 'content-type': 'text/html; charset=utf-8' });
      const out = template.createOut();
      template.render(d, out);

      out.on('error', next);
      out.on('finish', () => {
        const html = cleanChunk(out.getOutput());
        this.send(pretty(html));
      });
      out.end();
    };
    return next();
  }

  res.write = function clean(...args) {
    const [chunk] = args;
    if (typeof chunk !== 'string') {
      write.apply(this, args);
    } else {
      const cleanedArgs = [...args];
      cleanedArgs[0] = cleanChunk(chunk);
      write.apply(this, cleanedArgs);
    }
  };

  return next();
};
