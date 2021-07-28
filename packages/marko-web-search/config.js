const Joi = require('@parameter1/joi');
const { validate } = require('@parameter1/joi/utils');
const { getDefaultContentTypes } = require('@parameter1/base-cms-utils');
const { underscore } = require('@parameter1/base-cms-inflector');

const defaultContentTypes = getDefaultContentTypes();

module.exports = (params = {}) => {
  const { pageLimit, filters } = validate(Joi.object({
    pageLimit: Joi.number().integer().min(1).max(100)
      .default(20),
    filters: Joi.object({
      contentTypes: Joi.array().items(
        Joi.string().trim().allow(...defaultContentTypes),
      ).default(defaultContentTypes),
      sections: Joi.array().items(
        Joi.object({
          id: Joi.number().integer().min(1),
          name: Joi.string().trim().required(),
        }),
      ).default([]),
    }).default({}),
  }).default({}), params);

  const contentTypes = filters.contentTypes.map(type => underscore(type).toUpperCase());
  const contentTypeMap = contentTypes.reduce((m, type) => {
    m.set(type, true);
    return m;
  }, new Map());
  const sections = filters.sections.slice();
  const sectionIds = sections.map(id => id);
  const sectionIdMap = sectionIds.reduce((m, id) => {
    m.set(id, true);
    return m;
  }, new Map());

  return Object.create({
    pageLimit,
    filters: {
      contentTypes,
      contentTypeMap,

      sections,
      sectionIds,
      sectionIdMap,
    },
  });
};
