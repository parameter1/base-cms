
const moment = require('moment');
const gql = require('graphql-tag');
const { asyncRoute } = require('@parameter1/base-cms-utils');
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

const ROOT_ALIAS = '/html-sitemap';

module.exports = (app) => {
  app.get(`${ROOT_ALIAS}/:year(\\d{4})/:month(\\d{2})/:day(\\d{2})`, asyncRoute(async (req, res) => {
    const { year, month, day } = req.params;

    // Validate date
    const dateString = `${year}-${month}-${day}`;
    const date = moment(dateString, FORMAT);
    if (!date.isValid()) throw invalidDate();
    const now = moment().endOf('day');
    if (date > now) throw dateNotFound();

    // Set page data
    const ending = moment(dateString).endOf('day');
    const after = moment(dateString).startOf('day');
    const displayMonth = moment(dateString).format('MMMM');
    return res.marko(
      dayTemplate,
      {
        ending,
        after,
        year,
        month: displayMonth,
        day,
      },
    );
  }));

  app.get(`${ROOT_ALIAS}/:year(\\d{4})/:month(\\d{2})`, asyncRoute(async (req, res) => {
    const { year, month } = req.params;
    const startOfMonth = moment(`${year}-${month}-01`, FORMAT);
    if (!startOfMonth.isValid()) throw invalidDate();
    const endOfMonth = startOfMonth.clone().endOf('month');
    const now = moment().endOf('day');
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
    const nodes = data.allPublishedContentDates.map((node) => {
      const alias = `${ROOT_ALIAS}/${year}/${month.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })}`;
      const publishedContentNode = node;
      publishedContentNode.alias = `${alias}/${node.day.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })}`;
      return publishedContentNode;
    });
    return res.marko(
      dateListTemplate,
      {
        nodes,
        year,
        month: startOfMonth.format('MMMM'),
        displayType: 'day',
      },
    );
  }));

  app.get(`${ROOT_ALIAS}/:year(\\d{4})`, asyncRoute(async (req, res) => {
    const { year } = req.params;
    const now = moment().endOf('day');
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
    const nodes = data.allPublishedContentDates.map((node) => {
      const alias = `${ROOT_ALIAS}/${year}`;
      const publishedContentNode = node;
      publishedContentNode.alias = `${alias}/${node.month.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })}`;
      return publishedContentNode;
    });
    return res.marko(
      dateListTemplate,
      {
        nodes,
        year,
        displayType: 'month',
      },
    );
  }));

  app.get(`${ROOT_ALIAS}`, asyncRoute(async (req, res) => {
    const now = moment().endOf('day');
    const year = moment().format('YYYY');
    const nowFormatted = now.format(FORMAT);
    const end = `${year}-12-31`;
    const before = nowFormatted < end ? nowFormatted : end;
    const input = {
      before,
      format: 'years',
    };
    const variables = { input };
    const { data } = await req.apollo.query({ query: ALL_PUBLISHED_CONTENT_DATES, variables });
    const nodes = data.allPublishedContentDates.map((node) => {
      const publishedContentNode = node;
      publishedContentNode.alias = `${ROOT_ALIAS}/${node.year}`;
      return publishedContentNode;
    });
    return res.marko(
      dateListTemplate,
      {
        nodes,
        displayType: 'year',
      },
    );
  }));
};
