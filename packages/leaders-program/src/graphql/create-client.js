import sha1 from './sha1';

const getOperationName = (string) => {
  const matches = /query\s+([a-z0-9]+)[(]?.+{/gi.exec(string);
  if (matches && matches[1]) return matches[1];
  return undefined;
};

export default ({ uri, headers: globalHeaders }) => {
  const cache = new Map();
  return Object.create({
    query: async ({ query, variables, headers }) => {
      const body = JSON.stringify({
        operationName: getOperationName(query),
        variables,
        query,
      });
      const hash = await sha1(body);
      if (hash && cache.has(hash)) return cache.get(hash);

      const res = await fetch(uri, {
        method: 'POST',
        headers: {
          ...globalHeaders,
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
      if (hash) cache.set(hash, json);
      return json;
    },
  });
};
