const Joi = require('@parameter1/joi');
const { validate } = require('@parameter1/joi/utils');
const { getDefaultContentTypes } = require('@parameter1/base-cms-utils');
const { titleize, underscore } = require('@parameter1/base-cms-inflector');
const MarkoWebSearchQueryParamConfig = require('./query-params');

const defaultContentTypes = getDefaultContentTypes();

class MarkoWebSearchConfig {
  /**
   *
   * @param {object} params
   *
   * @param {object} [params.resultsPerPage=10] The results per page setting.
   * @param {number} [params.resultsPerPage.min=1]
   * @param {number} [params.resultsPerPage.max=100]
   * @param {number} [params.resultsPerPage.defaukt=20]
   *
   * @param {string[]} [params.contentTypes] The allowed content type filters. Defaults to all.
   *                                         Should be provided as an array of classified content
   *                                         type strings, e.g. ['Article', 'MediaGallery'] etc.
   *
   * @param {object[]} [params.assignedToWebsiteSections] The allowed website section filters.
   *                                                      Defaults to none. Should be an array of
   *                                                      section objects, e.g.
   *                                                      [{ id: 123 label: 'Foo', }]
   *
   */
  constructor(params = {}) {
    const {
      resultsPerPage,
      contentTypes,
      assignedToWebsiteSections,
    } = validate(Joi.object({
      resultsPerPage: Joi.object({
        min: Joi.number().integer().default(1),
        max: Joi.number().integer().default(100),
        default: Joi.number().integer().default(20),
      }).default({}),

      contentTypes: Joi.array().items(
        Joi.string().trim().allow(...defaultContentTypes),
      ).default(defaultContentTypes),

      assignedToWebsiteSections: Joi.array().items(
        Joi.object({
          id: Joi.number().integer().min(1),
          label: Joi.string().trim().required(),
        }),
      ).default([]),
    }).default({}), params);

    this.contentTypeObjects = contentTypes.map(type => ({
      id: underscore(type).toUpperCase(),
      label: titleize(type),
    }));

    this.assignedToWebsiteSections = assignedToWebsiteSections;

    this.queryParams = new MarkoWebSearchQueryParamConfig({
      resultsPerPage,
      contentTypeIds: this.contentTypeObjects.map(({ id }) => id),
      assignedToWebsiteSectionIds: assignedToWebsiteSections.map(section => section.id),
    });
  }
}

module.exports = MarkoWebSearchConfig;
