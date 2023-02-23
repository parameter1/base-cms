const fetch = require('node-fetch');
const { error, log } = console;

setInterval(async () => {
  try {
    const res = await fetch('http://localhost:80', { method: 'get' });
    if (!res.ok) {
      error('Response not ok!', res.status, res.statusText);
      process.exit(1);
    } else {
      const html = await res.text();
      const found = /.*<\/head>.*<\/body>.*<\/html>.*/is.test(html);
      if (!found) {
        error('Unable to find closing HTML tags!');
        process.exit(1);
        return;
      }
      // now check for any server errors
      if (/data-marko-error="true"/g.test(html)) {
        error('An in-page server-side Marko error was encountered!');
        process.exit(1);
        return;
      }
      log('Integration tests passed!');
      process.exit(0);
    }
  } catch (e) {
    // noop
  }
}, 100);
