const { getAsArray } = require('@parameter1/base-cms-object-path');
const gql = require('graphql-tag');
const { asyncRoute } = require('@parameter1/base-cms-utils');
const dayjs = require('@parameter1/base-cms-dayjs');
const dateListTemplate = require('../templates/date-list');
const dayTemplate = require('../templates/day');

const FORMAT = 'YYYY-MM-DD';
const dateNotFound = () => {
  const error = new Error('The requested date was not found.');
  error.statusCode = 404;
  return error;
};
const invalidDate = () => {
  const error = new Error('The requested date is invalid.');
  error.statusCode = 400;
  return error;
};

const getTwoCharNum = (number) => number.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });

const ALL_PUBLISHED_CONTENT_DATES = gql`
  query AllPublishedContentDates($input: AllPublishedContentDatesQueryInput = {}) {
    allPublishedContentDates(input: $input) {
      id,
      year,
      month,
      day,
      count
    }
  }
`;

module.exports = (app, { mountPoint } = { mountPoint: '/site-map' }) => {
  app.get(`${mountPoint}/:year(\\d{4})/:month(\\d{2})/:day(\\d{2})`, asyncRoute(async (req, res) => {
    const { year, month, day } = req.params;

    // Validate date
    const dateString = `${year}-${month}-${day}`;
    const date = dayjs(dateString, FORMAT);
    if (!date.isValid()) throw invalidDate();
    const now = dayjs().endOf('day');
    if (date > now) throw dateNotFound();

    // Set page data
    const ending = date.endOf('day');
    const after = date.startOf('day');
    const displayMonth = date.format('MMMM');
    return res.marko(
      dayTemplate,
      {
        ending,
        after,
        year,
        month: displayMonth,
        day,
        mountPoint,
      },
    );
  }));

  app.get(`${mountPoint}/:year(\\d{4})/:month(\\d{2})`, asyncRoute(async (req, res) => {
    const { year, month } = req.params;
    const startOfMonth = dayjs(`${year}-${month}-01`, FORMAT);
    if (!startOfMonth.isValid()) throw invalidDate();
    const endOfMonth = startOfMonth.clone().endOf('month');
    const now = dayjs().endOf('day');
    const after = startOfMonth.format(FORMAT);
    if (startOfMonth > now) throw dateNotFound();
    const before = (endOfMonth > now ? now : endOfMonth).format(FORMAT);
    const input = {
      before,
      after,
      format: 'days',
    };
    const variables = { input };
    const { data } = await req.apollo.query({ query: ALL_PUBLISHED_CONTENT_DATES, variables });
    const alias = `${mountPoint}/${year}/${getTwoCharNum(month)}`;
    const nodes = getAsArray(data, 'allPublishedContentDates').map((node) => ({
      ...node,
      alias: `${alias}/${getTwoCharNum(node.day)}`,
    }));
    return res.marko(
      dateListTemplate,
      {
        nodes,
        year,
        month: startOfMonth.format('MMMM'),
        displayType: 'day',
        mountPoint,
      },
    );
  }));

  app.get(`${mountPoint}/:year(\\d{4})`, asyncRoute(async (req, res) => {
    const { year } = req.params;
    const now = dayjs().endOf('day');
    if (year > now.format('year')) throw dateNotFound();
    const nowFormatted = now.format(FORMAT);
    const end = `${year}-12-31`;
    const after = `${year}-01-01`;
    const before = nowFormatted < end ? nowFormatted : end;
    const input = {
      before,
      after,
      format: 'months',
    };
    const variables = { input };
    const { data } = await req.apollo.query({ query: ALL_PUBLISHED_CONTENT_DATES, variables });
    const alias = `${mountPoint}/${year}`;
    const nodes = getAsArray(data, 'allPublishedContentDates').map((node) => ({
      ...node,
      alias: `${alias}/${getTwoCharNum(node.month)}`,
    }));
    return res.marko(
      dateListTemplate,
      {
        nodes,
        year,
        displayType: 'month',
        mountPoint,
      },
    );
  }));

  app.get(`${mountPoint}`, asyncRoute(async (req, res) => {
    const now = dayjs().endOf('day');
    const year = dayjs().format('YYYY');
    const nowFormatted = now.format(FORMAT);
    const end = `${year}-12-31`;
    const before = nowFormatted < end ? nowFormatted : end;
    const input = {
      before,
      format: 'years',
    };
    const variables = { input };
    const { data } = await req.apollo.query({ query: ALL_PUBLISHED_CONTENT_DATES, variables });
    const nodes = getAsArray(data, 'allPublishedContentDates').map((node) => ({
      ...node,
      alias: `${mountPoint}/${node.year}`,
    }));
    return res.marko(
      dateListTemplate,
      {
        nodes,
        displayType: 'year',
        mountPoint,
      },
    );
  }));
};
