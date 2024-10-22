const { getAsObject, getAsArray, get } = require('@parameter1/base-cms-object-path');
const { asObject } = require('@parameter1/base-cms-utils');
const buildQueryString = require('../utils/build-query-string');

module.exports = ({ obj, req }) => {
  const content = asObject(obj);
  const company = getAsObject(content, 'company');
  const createdBy = getAsObject(content, 'createdBy');
  const section = getAsObject(content, 'primarySection');
  const userRegistration = getAsObject(content, 'userRegistration');
  const hierarchy = getAsArray(section, 'hierarchy').map((s) => ({
    id: s.id,
    name: s.name,
    alias: s.alias,
  }));
  const taxonomy = getAsArray(content, 'taxonomy.edges').map(({ node }) => ({
    id: node.id,
    type: node.type,
    name: node.name,
    fullName: node.fullName,
  }));
  const authors = getAsArray(content, 'authors.edges').map(({ node }) => ({
    id: node.id,
    name: node.name,
  }));
  const schedules = getAsArray(content, 'websiteSchedules').map(({ section: s }) => ({
    id: s.id,
    name: s.name,
  }));
  const emailSchedules = getAsArray(content, 'emailSchedules')
    .map((schedule) => ({ name: schedule.newsletter.name, deploymentDate: schedule.deploymentDate }))
    .sort((a, b) => a.deploymentDate - b.deploymentDate);
  const magazineSchedules = getAsArray(content, 'magazineSchedules')
    .map(({ issue: i }) => ({ name: i.name, mailDate: i.mailDate }))
    .sort((a, b) => new Date(a.mailDate) - new Date(b.mailDate));
  return {
    page_type: 'content',
    canonical_path: get(content, 'siteContext.path'),
    query_string: buildQueryString({ req }),
    content: {
      id: content.id,
      type: content.type,
      name: content.name,
      published: content.published ? new Date(content.published).toISOString() : undefined,
      labels: getAsArray(content, 'labels'),
      userRegistration,
    },
    created_by: {
      id: createdBy.id,
      username: createdBy.username,
      firstName: createdBy.firstName,
      lastName: createdBy.lastName,
    },
    company: {
      id: company.id,
      name: company.name,
    },
    section: {
      id: section.id,
      name: section.name,
      alias: section.alias,
      fullName: section.fullName,
    },
    section_hierarchy: hierarchy,
    taxonomy,
    authors,
    schedules,
    emailSchedules,
    magazineSchedules,
  };
};
