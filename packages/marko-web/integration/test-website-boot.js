const { htmlEntities } = require('@parameter1/base-cms-html');
const { sleep: wait, cleanPath } = require('@parameter1/base-cms-utils');
const whilst = require('async/whilst');
const eachLimit = require('async/eachLimit');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const { inspect } = require('util');

const { log } = console;

const origin = process.env.MARKO_WEB_INTEGRATION_TEST_URL || 'http://localhost:80';

const fetchResponse = async ({
  path = '/',
  catchErrors = false,
} = {}) => {
  const url = `${cleanPath(origin)}/${cleanPath(path)}`;
  log(`fetching ${url}`);
  const opts = { method: 'get', redirect: 'manual' };
  if (!catchErrors) return fetch(url, opts);
  try {
    return fetch(url, opts);
  } catch (e) {
    return null;
  }
};

const checkReadiness = async ({
  path = '/_health',
  startAfter = 5000,
  checkInterval = 2000,
  unhealthyAfter = 5,
} = {}) => {
  log('checking readiness...');
  log(`initially waiting for ${startAfter}ms before checking...`);
  await wait(startAfter);

  let timesChecked = 0;
  let booted = false;
  await whilst(async () => !booted, async () => {
    timesChecked += 1;
    if (timesChecked > unhealthyAfter) {
      throw new Error('The readiness probe has reached its maximum check limit.');
    }
    log(`pinging health check, attempt number ${timesChecked}...`);
    const res = await fetchResponse({ path, catchErrors: true });
    // if response is null, a connection error occrred
    if (res == null || (res && !res.ok)) {
      if (res == null) log('did not receive a response - assuming not ready.');
      if (res && !res.ok) log(`received a non-ok response from health check - ${res.status} ${res.statusText}`);
      log(`waiting another ${checkInterval}ms before retrying.`);
      await wait(checkInterval);
      return;
    }
    booted = true;
  });
  log('container is ready.');
};

const testPage = async ({ path, retryAttempts = 3, serverErrorsOnly = true } = {}) => {
  let timesChecked = 0;
  let finished = false;
  let html;
  const report = {
    path,
    error: null,
    checks: [],
  };
  await whilst(async () => !finished, async () => {
    const check = {};
    report.checks.push(check);
    timesChecked += 1;
    if (timesChecked > retryAttempts) {
      // max times reach, append error to report.
      report.error = new Error(`The test runner for page path ${path} has reached its maximum check limit.`);
      finished = true;
      return;
    }
    const res = await fetchResponse({ path });
    check.statusCode = res.status;
    if (!res.ok) {
      if (serverErrorsOnly && res.status < 500) {
        check.message = `received a ${res.status} from path ${path} but treating as passing since it was not a server error (>= 500).`;
        finished = true;
        return;
      }
      // received a 500, append the message and retry
      check.message = `received an error response from path page ${path} with status ${res.status} ${res.statusText}`;
      return;
    }
    html = await res.text();

    // first ensure the entire page rendered. if it didn't a fatal backened error occurred
    // that prevented rendering, or some kind of timeout occurred. this can be retried.
    const found = /.*<\/head>.*<\/body>.*<\/html>.*/is.test(html);
    if (!found) {
      // no render, append the message and retry.
      check.message = `unable to detect a full page render for path ${path} retrying...`;
      return;
    }

    // then check for in-body errors. this means an async internal block failed
    // but the page could fully render.
    const matches = [...html.matchAll(/data-marko-error="(.*?)"/g)];
    check.inPageErrors = [];
    matches.forEach((values) => {
      const value = values[1];
      check.inPageErrors.push(htmlEntities.decode(value));
    });
    if (check.inPageErrors.length) {
      // in-page errors occurred. exit and retry
      return;
    }
    // otherwise, mark as finished.
    finished = true;
  });
  return { html, report };
};

const run = async () => {
  await checkReadiness();

  // test homepage first, and get html.
  const { html, report: initialReport } = await testPage({ path: '/', serverErrorsOnly: false });

  const toTest = new Map([
    ['/search', {}],
    ['/site-map', {}], //
  ]);
  const contentToTest = new Map();

  const $ = cheerio.load(html);
  const $a = $('a[href^="/"]');

  $a.each(function getHref() {
    const href = $(this).attr('href');
    if (toTest.has(href) || href === '/') return;
    if (/\/\d{8}\//.test(href)) {
      // content page
      if (contentToTest.size === 5) return;
      contentToTest.set(href, {});
      return;
    }
    // non content pages
    if (toTest.size === 10) return;
    toTest.set(href, {});
  });

  // now test all extracted pages.
  const errors = [];
  const reports = [initialReport];
  await eachLimit([...toTest, ...contentToTest], 2, async ([path, opts]) => {
    // catch all errors so they can be reported on at once.
    // these should be internal at this point.
    try {
      const { report } = await testPage({ ...opts, path });
      reports.push(report);
    } catch (e) {
      errors.push(e);
    }
  });

  if (errors.length) {
    log('INTERNAL TESTING ERRORS ENCOUNTERED');
    errors.forEach((error) => {
      log(error);
    });
    throw new Error('Internal testing errors were encountered.');
  }

  const errorReports = reports.filter((report) => report.error);
  if (errorReports.length) {
    log('PAGE ERRORS ENCOUNTERED');
    errorReports.forEach((report) => log(report));
    throw new Error('Page errors were encountered.');
  }
  log('test results', inspect(reports, { colors: true, depth: null }));
};

run().catch((e) => setImmediate(() => { throw e; }));
