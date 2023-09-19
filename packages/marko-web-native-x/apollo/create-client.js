const fetch = require('node-fetch');
const { get } = require('@parameter1/base-cms-object-path');

const getOperationName = (string) => {
  const matches = /query\s+([a-z0-9]+)[(]?.+{/gi.exec(string);
  if (matches && matches[1]) return matches[1];
  return undefined;
};

module.exports = (uri) => Object.create({
  query: async ({ query, variables, headers }) => {
    const body = JSON.stringify({
      operationName: getOperationName(query),
      variables,
      query: get(query, 'loc.source.body', query),
    });

    const res = await fetch(uri, {
      method: 'POST',
      headers: {
        ...headers,
        'content-type': 'application/json',
      },
      body,
    });
    const json = await res.json();
    if (!res.ok || (json && json.errors)) {
      if (!json || !json.errors) {
        const err = new Error(`An unknown, fatal GraphQL error was encountered (${res.status})`);
        err.statusCode = res.status;
        throw err;
      }
      const [networkError] = json.errors;
      const err = new Error(networkError.message);
      const { extensions } = networkError;
      if (extensions) err.code = extensions.code;
      if (extensions && extensions.exception) err.statusCode = extensions.exception.statusCode;
      throw err;
    }
    return json;
  },
});
