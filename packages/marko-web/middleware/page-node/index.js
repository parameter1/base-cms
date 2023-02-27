const { isFunction: isFn } = require('@parameter1/base-cms-utils');
const { getAsObject } = require('@parameter1/base-cms-object-path');
const ResolvedNode = require('./resolved');

const createNode = (data) => new ResolvedNode(data);

class PageNode {
  constructor(apolloClient, {
    queryFactory,
    queryFragment,
    variables,
    resultField,
    sideloadDataFn,
  }) {
    this.apolloClient = apolloClient;
    this.queryFactory = queryFactory;
    this.queryFragment = queryFragment;
    this.variables = variables;
    this.resultField = resultField;
    this.sideloadDataFn = sideloadDataFn;
  }

  async load() {
    if (!this.promise) {
      const { queryFragment, variables, resultField } = this;
      const path = `data.${resultField}`;
      const query = this.queryFactory({ queryFragment, queryName: 'PageNode' });
      const [r, sideloadedData] = await Promise.all([
        this.apolloClient.query({ query, variables }),
        (async () => {
          if (isFn(this.sideloadDataFn)) {
            this.sideloadDataFn.bind(this);
            return this.sideloadDataFn();
          }
          return undefined;
        })(),
      ]);
      this.promise = createNode(getAsObject(r, path));
      this.sideloadedData = sideloadedData;
    }
    return this.promise;
  }
}

module.exports = PageNode;
