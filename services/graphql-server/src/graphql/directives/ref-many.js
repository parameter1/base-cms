const { SchemaDirectiveVisitor } = require('graphql-tools');
const { BaseDB } = require('@parameter1/base-cms-db');
const { createEmptyResponse } = require('@parameter1/base-cms-db/src/paginate/utils');
const cursor = require('@parameter1/base-cms-db/src/paginate/cursor');
const { UserInputError } = require('apollo-server-express');
const formatStatus = require('../utils/format-status');
const criteriaFor = require('../utils/criteria-for');
const applyInput = require('../utils/apply-input');
const shouldCollate = require('../utils/should-collate');
const connectionProjection = require('../utils/connection-projection');
const buildQuery = require('../ref-query-builders');

const { isArray } = Array;

class RefManyDirective extends SchemaDirectiveVisitor {
  /**
   *
   * @param {*} field
   */
  visitFieldDefinition(field) {
    // eslint-disable-next-line no-param-reassign
    field.resolve = async (doc, variables, ctx, info) => {
      const start = process.hrtime();
      const { input = {} } = variables;
      const { basedb, site } = ctx;

      const {
        model,
        using,
        criteria,
        withSite,
        siteField,
        refQueryBuilder,
        localField,
        foreignField,
      } = this.args;

      const fieldName = localField || field.name;
      const refs = BaseDB.get(doc, fieldName);
      if (!refs) return BaseDB.paginateEmpty();

      // check if the ref manies were preloaded.
      const toCheck = isArray(refs) ? refs : [refs];
      if (toCheck.every((o) => o && o._id)) {
        // return as-is when preloaded.
        return {
          ...createEmptyResponse(),
          edges: () => toCheck.map((node) => ({ node, cursor: () => cursor.encode(node._id) })),
          totalCount: () => toCheck.length,
        };
      }
      const ids = BaseDB.extractRefIds(toCheck);
      if (!ids.length) return BaseDB.paginateEmpty();

      const {
        status,
        pagination,
      } = input;

      const siteId = input.siteId || site.id();

      const isInverse = foreignField !== '_id';
      if (input.sort.order === 'values' && isInverse) throw new UserInputError('Cannot use `values` sort on an inverse reference.');

      const applied = applyInput({
        query: {
          ...criteriaFor(criteria),
          ...formatStatus(status),
          [foreignField]: ids.length === 1 ? ids[0] : { $in: ids },
        },
        using,
        input,
        ...(withSite && siteId && { siteId, siteField }),
      });

      const { query, sort } = await buildQuery(refQueryBuilder, {
        doc,
        currentValues: { query: applied, sort: input.sort },
        variables,
        ctx,
        info,
      });

      const projection = connectionProjection(info);
      const result = await basedb.paginate(model, {
        query,
        sort: { ...sort, values: ids },
        ...pagination,
        collate: shouldCollate(sort.field),
        projection,
      });
      basedb.log('@refMany', start, { model });
      return result;
    };
  }
}

module.exports = RefManyDirective;
