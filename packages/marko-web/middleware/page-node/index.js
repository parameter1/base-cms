const { getAsObject } = require('@parameter1/base-cms-object-path');
const ResolvedNode = require('./resolved');

const createNode = data => new ResolvedNode(data);

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
      if (typeof this.sideloadDataFn === 'function') {
        this.sideloadDataFn.bind(this);
        this.promise = Promise.all([
          this.apolloClient.query({ query, variables }),
          this.sideloadDataFn(),
        ]).then(([r, sideloadedData]) => {
          this.sideloadedData = sideloadedData;
          return createNode(getAsObject(r, path));
        });
      } else {
        this.promise = this.apolloClient.query({ query, variables })
          .then(r => createNode(getAsObject(r, path)));
      }
    }
    return this.promise;
  }
}

module.exports = PageNode;
