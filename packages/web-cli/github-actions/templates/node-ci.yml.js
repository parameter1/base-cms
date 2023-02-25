module.exports = `name: Node.js CI

on:
  push:
    branches: ["*"]
  pull_request:
    branches: ["*"]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - uses: actions/setup-node@v3
      with:
        node-version: 14.21

    - uses: actions/cache@v3
      id: yarn-cache
      with:
        path: '**/node_modules'
        key: \${{ runner.os }}-modules-\${{ hashFiles('**/yarn.lock') }}

    - name: Install dependencies
      if: steps.yarn-cache.outputs.cache-hit != 'true'
      run: yarn install --frozen-lockfile

    - run: yarn test
`;
