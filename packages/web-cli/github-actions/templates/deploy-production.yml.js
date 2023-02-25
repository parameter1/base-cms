module.exports = `name: Deploy sites (production)

on:
  push:
    tags:
      - 'v[0-9]+.[0-9]+.[0-9]+'

jobs:
  version:
    runs-on: ubuntu-latest
    steps:
    - id: tag_version
      run: |
        REF=$(echo $GITHUB_REF | cut -d / -f 3)
        [[ "$GITHUB_REF" =~ ^refs/tags.*$ ]] && VERSION="$REF" || VERSION="\${REF}-\${GITHUB_SHA::7}"
        echo "version=$VERSION" >> $GITHUB_OUTPUT
    outputs:
      version: \${{ steps.tag_version.outputs.version }}

  notify-start:
    needs: [version]
    uses: parameter1/actions/.github/workflows/notify-start.yml@main
    secrets: inherit
    with:
      version: \${{ needs.version.outputs.version }}

  post-deploy-failure:
    if: failure()
    needs: [notify-start, deploy-sites]
    uses: parameter1/actions/.github/workflows/notify-fail.yml@main
    secrets: inherit
    with:
      slack-thread: \${{ needs.notify-start.outputs.slack-thread }}

  post-deploy-complete:
    if: success()
    needs: [notify-start, deploy-sites]
    uses: parameter1/actions/.github/workflows/notify-complete.yml@main
    secrets: inherit
    with:
      slack-thread: \${{ needs.notify-start.outputs.slack-thread }}

  ######################
  # Add websites here! #
  ######################

  build-sites:
    needs: [version]
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
      push: true
      site_account: \${{ matrix.site.account }}
      site_dir: \${{ matrix.site.dir }}
      site_version: \${{ needs.version.outputs.version }}
    secrets: inherit

  deploy-sites:
    needs: [version, build-sites]
    uses: parameter1/actions/.github/workflows/website-deploy-production.yml@main
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
      rancher_label: \${{ matrix.site.rancher_label }}
      site_account: \${{ matrix.site.account }}
      site_dir: \${{ matrix.site.dir }}
      site_stack: \${{ matrix.site.stack }}
      site_version: \${{ needs.version.outputs.version }}
    secrets: inherit
`;
