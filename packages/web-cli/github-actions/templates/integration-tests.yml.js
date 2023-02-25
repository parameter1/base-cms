module.exports = `name: Integration Tests

on:
  push:
    branches: ["*"]
  pull_request:
    branches: ["*"]

jobs:
  build-and-test-image:
    uses: parameter1/actions/.github/workflows/website-build-push-test.yml@main
    strategy:
      matrix:
        ###############################################
        #v# Make sure this matches the site matrix! #v#
        ###############################################
        {{{ INSERT MATRIX HERE }}}
        ###############################################
        #^# Make sure this matches the site matrix! #^#
        ###############################################
    with:
      ecr_registry: \${{ vars.AWS_ECR_REGISTRY }}
      site_account: \${{ matrix.site.account }}
      site_dir: \${{ matrix.site.dir }}
      site_version: test
`;
