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
      docker_image: website-\${{ matrix.site.dir }}
      site_id: \${{ matrix.site.id }}
      site_host: \${{ matrix.site.dir }}
      infra_stack: \${{ matrix.site.stack }}
      tenant_key: \${{ matrix.site.tenant }}
      ecr_registry: \${{ vars.AWS_ECR_REGISTRY }}
`;
