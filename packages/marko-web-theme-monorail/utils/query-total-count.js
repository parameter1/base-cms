const gql = require('graphql-tag');
const { asObject } = require('@parameter1/base-cms-utils');

const queryMap = {
  'website-scheduled-content': gql`
    query WebsiteScheduledContentCount($input: WebsiteScheduledContentQueryInput!) {
      result: websiteScheduledContent(input: $input) {
        totalCount
      }
    }
  `,
  'website-optioned-content': gql`
    query WebsiteScheduledContentCount($input: WebsiteScheduledContentQueryInput!) {
      result: websiteScheduledContent(input: $input) {
        totalCount
      }
    }
  `,
  'all-author-content': gql`
    query AllAuthorContentCount($input: AllAuthorContentQueryInput!) {
      result: allAuthorContent(input: $input) {
        totalCount
      }
    }
  `,
  'all-company-content': gql`
    query AllCompanyContentCount($input: AllCompanyContentQueryInput!) {
      result: allCompanyContent(input: $input) {
        totalCount
      }
    }
  `,
  'all-published-content': gql`
    query AllPublishedContentCount($input: AllPublishedContentQueryInput!) {
      result: allPublishedContent(input: $input) {
        totalCount
      }
    }
  `,
  'magazine-active-issues': gql`
    query MagazineActiveIssuesCount($input: MagazineActiveIssuesQueryInput!) {
      result: magazineActiveIssues(input: $input) {
        totalCount
      }
    }
  `,
  'magazine-scheduled-content': gql`
    query MagazineScheduledContent($input: MagazineScheduledContentQueryInput!) {
      result: magazineScheduledContent(input: $input) {
        totalCount
      }
    }
  `,
};

const date = (v) => (v instanceof Date ? v.valueOf() : v);

const validate = (params) => {
  const p = asObject(params);
  // Ref package web-common/src/block-loader/website-scheduled-content.js
  // If endingAfter set ending to the following and remove invalid endingAfter param
  if (p.endingAfter) {
    p.ending = { after: date(p.endingAfter) };
    delete p.endingAfter;
  }
  delete p.queryFragment;
  delete p.sectionFragment;
  return p;
};

module.exports = async (apollo, {
  name,
  params,
} = {}) => {
  const query = queryMap[name];
  if (!query) throw new Error(`No query has been defined for ${name}`);

  const input = validate(params);
  const { data } = await apollo.query({ query, variables: { input } });

  return data.result.totalCount;
};
