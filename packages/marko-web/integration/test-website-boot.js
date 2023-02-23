const fetch = require('node-fetch');
const { htmlEntities } = require('@parameter1/base-cms-html');

const { error, log } = console;

const url = process.env.MARKO_WEB_INTEGRATION_TEST_URL || 'http://localhost:80';

setInterval(async () => {
  try {
    const res = await fetch(url, { method: 'get' });
    if (!res.ok) {
      error('Response not ok!', res.status, res.statusText);
      process.exit(1);
    } else {
      const html = await res.text();
      // check for in-body body errors
      const matches = [...html.matchAll(/data-marko-error="(.*?)"/g)];
      const errors = [];
      matches.forEach((values) => {
        const value = values[1];
        errors.push(htmlEntities.decode(value));
      });
      if (errors.length) {
        error('In-page, server-side Marko error(s) were encountered!', errors);
        process.exit(0);
      }

      // if not in-body errors, ensure page rendered.
      const found = /.*<\/head>.*<\/body>.*<\/html>.*/is.test(html);
      if (!found) {
        error('Unable to find closing HTML tags!');
        process.exit(1);
      }
      log('Integration tests passed!');
      process.exit(0);
    }
  } catch (e) {
    // noop
  }
}, 100);
