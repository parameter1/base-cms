# Migrating from 3.x to 4.x

## Prerequisites
Before following the migration steps, make sure the following have been completed.

1. Select the target website or newsletter repo to upgrade and pull all latest changes from `master`/`main`.
2. Create a new branch called `4.x` and push it to your fork. This is where all changes will be pushed to.
3. Ensure you're only loading _one_ repo into VSCode at a time.

4. Ensure you have the latest depenency tool installed _globally_. To do so, run the following command:
    ```bash
    yarn global add @parameter1/base-cms-dependency-tool@v4.1.0
    ```

5. Down any running Docker containers in your project by running the following from the project root
    ```bash
    docker-compose down
    ```

6. It's **highly recommended** that you recursively delete _all_ `node_modules` folders
    ```bash
    find . -name 'node_modules' -type d -prune -exec rm -rf '{}' +
    ```

## Upgrade Docker Node Images from 10 to 14

### Action Items
1. References to `node:10` images (specifically, `node:10.24`) should be changed to `node:14.21` in _all_ files named
    - `docker-compose.yml`
    - `Dockerfile`

2. If GitHub actions are used by the repo, the `node-version` value must be changed to `14.21` in the `.github/workflows/node-ci.yml` file. If TravisCI is still used, check the `.travis` file in the root of the project and update the node version.

## Upgrade Support Dependencies

### Action Items
1. Upgrade `lerna` to the latest major version in your root `package.json` file
    ```json
    "lerna": "^6.5.1"
    ```
2. Upgrade `newrelic` to the latest major version whereever present in your `package.json` files - usually in the `packages/global` package.
    ```json
    "newrelic": "^9.10.1"
    ```

## BaseCMS Dependencies
All core `@parameter1/base-cms-*` dependencies will need to be upgraded to the latest versions. Additionally, because lower-level dependencies (such as `@babel/*` and `node-sass`) had significant version adjustments, references to these should be deleted from the `yarn.lock` before running an install.

### Action Items
1. Upgrade all BaseCMS dependencies to v4.x by running the below in the project root
    ```bash
    p1-basecms-dependencies upgrade --latest
    ```

2. Once completed, _do not_ run a `yarn install` yet. We'll save that to the very end. :)
3. Delete references to `@babel/*` dependencies in the `yarn.lock` file. The easiest way to do this is to search in the file using regex `^"@babel\/` and then delete all entries. There may be _alot_ of these, and that's okay :)
4. Now run `./scripts/yarn.sh` -- this should run in the new Node14 Docker container (which may need to be downloaded). **MAKE SURE YOU RUN THE INSTALL USING THE SCRIPT** This ensures the install runs in the proper version of Node.

## SASS/SCSS Updates
The new build process will no longer resolve relative `@import` statements to files located in `node_modules`. The good news, however, is that it _can_ import using standard package names.

### Action Items
1. Update relative node_module `@import` declarations in `.scss` files to their absolute counterparts. For example:
    - `@import "../../node_modules/bootstrap/scss/mixins"` would become `@import "bootstrap/scss/mixins";`
    - the number of relative parent paths does not matter... so `../` and `../../` and `../../../` etc all need to be removed.
2. The quickest way to change the import statements is to search all `.scss` files using regex `@import ".*\/node_modules\/` and replacing the matched entries with `@import "` (note the ending double-quote -- that should be there)
3. To avoid possible deprecation errors when building, run `yarn global add sass-migrator` and then run `sass-migrator division **/*.scss` from the project root. This should replace instances where deprecated division (`/`) operators are being used.

## Component Changes
The `marko-web-deferred-script-loader` is now loaded into core. As such, certain component calls can be removed.

### Action Items
1. Remove any references to components `<marko-web-deferred-script-loader-init />` and `<marko-web-deferred-script-loader-load />`. These normally occur in the site or global `document.marko` file.

## Improved CLI
The CLI was significantly improved for performance and build time speed. While the CLI commands are still named the same (except for dropping `lint` -- see [ESLint](#eslint) and [Stylelint](#stylelint) sections) their arguments need to be adjusted to ensure proper dev server operation, production build, and testing functions.

**NOTE ON @PARAMETER1/BASE-CMS MARKO FILES:** All `.marko` files inside `@parameter1/base-cms-*` packages (found in `node_modules`) are now compiled when the package is built and _published_ to NPM. Because of this, the compiled `.marko.js` files will already exist in `node_modules` when the packages are installed. These files are _not_ automatically compiled by the new CLI. The drawback is that you can no longer modify `.marko` files found in `node_modules` without re-compiling manually. If you make changes to a `.marko` file within `node_modules`, you'll need to re-compile by running the below from the root of your project:
```bash
yarn basecms-marko-compile compile --cwd ./node_modules/@parameter1/base-cms-marko-web-[name-of-package] --no-clean
```
If the website's dev server is running, this will _not_ automatically restart the server and you'll need to save a file within the site folder to trigger the restart.

### Action Items
1. Update the website scripts found in `./sites/*/package.json` files with the following:
    ```json
    "scripts": {
      "dev": "basecms-website dev --compile-dir ../../packages --watch-dir ../../packages",
      "build": "basecms-website build",
      "compile": "basecms-marko-compile compile",
      "lint": "eslint --ext .js --ext .vue --max-warnings 5 --config ../../.eslintrc.js --ignore-path ../../.eslintignore ./",
      "lint:fix": "yarn lint --fix",
      "test": "yarn lint && yarn compile --no-clean"
    }
    ```

2. Update the package scripts found in `./packages/*/package.json` files with the following:
    ```json
    "scripts": {
      "compile": "basecms-marko-compile compile",
      "build": "yarn compile",
      "lint": "eslint --ext .js --ext .vue --max-warnings 5 --config ../../.eslintrc.js --ignore-path ../../.eslintignore ./",
      "lint:fix": "yarn lint --fix",
      "test": "yarn lint && yarn compile --no-clean"
    },
    ```

3. Update the core/root scripts found in `./package.json` files with the following:
    ```json
    "scripts": {
      "build": "lerna run build",
      "compile": "lerna run compile",
      "lint": "lerna run lint",
      "lint:fix": "lerna run lint:fix",
      "test": "lerna run test"
    }
    ```
4. The root `Dockerfile` will need updating to properly build the sites in production. Replace the contents of the file with the following:
    ```Dockerfile
    FROM node:14.21 as build
    WORKDIR /repo
    ARG SITE

    ADD package.json yarn.lock lerna.json /repo/
    ADD packages /repo/packages
    ADD sites/$SITE /repo/sites/$SITE
    RUN --mount=type=cache,target=/repo/.yarn YARN_CACHE_FOLDER=/repo/.yarn yarn install --frozen-lockfile
    ENV NODE_ENV production
    RUN yarn build

    FROM node:14.21-alpine
    ENV NODE_ENV production
    ENV PORT 80
    ARG SITE
    COPY --from=build /repo /repo
    WORKDIR /repo/sites/$SITE
    ENTRYPOINT [ "node", "index.js" ]
    ```
    - This will run the `build` script found in each website (js/css/ssr/marko) and each package (compiles Marko files)

5. Verify that the sites in `docker-compose.yml` are using `yarn dev` as their entrypoint and command. Some sites run the `basecms-website` command directly. Replace the `x-site-command` entry with the following:
    ```Dockerfile
    x-site-command: &site-cmd
      <<: *node
      entrypoint: ["yarn"]
      command: ["dev"]
    ```

## GitHub Actions / Production Builds
Note: all of the below files are located in the `.github/workflows` folder.

### Action Items
0. Create the `tests/integration.js` file in the root of the repository with the following contents
    ```js
    // eslint-disable-next-line
    require('@parameter1/base-cms-marko-web/integration/test-website-boot');
    
    ```
2. Update the `node-ci.yml` file to the following:
    ```yml
    name: Node.js CI

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
            key: ${{ runner.os }}-modules-${{ hashFiles('**/yarn.lock') }}

        - name: Install dependencies
          if: steps.yarn-cache.outputs.cache-hit != 'true'
          run: yarn install --pure-lockfile

        - run: yarn test
    ```

2. Create the `integration-tests.yml` file with the contents below. **NOTE** you must update the site configs found within the comments to match the current repo
    ```yml
    name: Integration Tests

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
            tenant_key: [abmedia_all]
            image_prefix: [ab-media]
            site:
              - { id: 60f6ec0bd28860bc3384daa1, stack: virgon, host: athleticbusiness.com }
              - { id: 60f6ec3bd28860bc3384e784, stack: virgon, host: woodfloorbusiness.com }
              - { id: 60f6ec34d28860bc3384e447, stack: virgon, host: aquamagazine.com }
            ###############################################
            #^# Make sure this matches the site matrix! #^#
            ###############################################
        with:
          docker_image: website-${{ matrix.site.host }}
          site_id: ${{ matrix.site.id }}
          site_host: ${{ matrix.site.host }}
          infra_stack: ${{ matrix.site.stack }}
          tenant_key: ${{ matrix.tenant_key }}
          ecr_registry: ${{ vars.AWS_ECR_REGISTRY }}
    ```

3. Update the `deploy-staging.yml` file:
    ```yml
    name: Deploy sites (staging)

    on:
      push:
        tags:
          - '*'

    jobs:
      version:
        runs-on: ubuntu-latest
        steps:
        - id: tag_version
          run: |
            REF=$(echo $GITHUB_REF | cut -d / -f 3)
            [[ "$GITHUB_REF" =~ ^refs/tags.*$ ]] && VERSION="$REF" || VERSION="${REF}-${GITHUB_SHA::7}"
            echo "version=$VERSION" >> $GITHUB_OUTPUT
        outputs:
          version: ${{ steps.tag_version.outputs.version }}

      notify-start:
        needs: [version]
        uses: parameter1/actions/.github/workflows/notify-start.yml@main
        secrets: inherit
        with:
          version: ${{ needs.version.outputs.version }}

      post-deploy-failure:
        if: failure()
        needs: [notify-start, deploy-sites]
        uses: parameter1/actions/.github/workflows/notify-fail.yml@main
        secrets: inherit
        with:
          slack-thread: ${{ needs.notify-start.outputs.slack-thread }}

      post-deploy-complete:
        if: success()
        needs: [notify-start, deploy-sites]
        uses: parameter1/actions/.github/workflows/notify-complete.yml@main
        secrets: inherit
        with:
          slack-thread: ${{ needs.notify-start.outputs.slack-thread }}

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
            tenant_key: [abmedia_all]
            image_prefix: [ab-media]
            site:
              - { id: 60f6ec0bd28860bc3384daa1, stack: virgon, host: athleticbusiness.com }
              - { id: 60f6ec3bd28860bc3384e784, stack: virgon, host: woodfloorbusiness.com }
              - { id: 60f6ec34d28860bc3384e447, stack: virgon, host: aquamagazine.com }
            ###############################################
            #^# Make sure this matches the site matrix! #^#
            ###############################################
        with:
          ecr_registry: ${{ vars.AWS_ECR_REGISTRY }}
          docker_image: ${{ vars.AWS_ECR_REGISTRY }}/${{ matrix.image_prefix }}-${{ matrix.site.host }}:${{ needs.version.outputs.version }}
          site_id: ${{ matrix.site.id }}
          site_host: ${{ matrix.site.host }}
          infra_stack: ${{ matrix.site.stack }}
          tenant_key: ${{ matrix.tenant_key }}
          push: true
        secrets: inherit

      deploy-sites:
        needs: [version, build-sites]
        uses: parameter1/actions/.github/workflows/website-deploy-staging.yml@main
        strategy:
          matrix:
            ###############################################
            #v# Make sure this matches the site matrix! #v#
            ###############################################
            tenant_key: [abmedia_all]
            image_prefix: [ab-media]
            site:
              - { id: 60f6ec0bd28860bc3384daa1, stack: virgon, host: athleticbusiness.com }
              - { id: 60f6ec3bd28860bc3384e784, stack: virgon, host: woodfloorbusiness.com }
              - { id: 60f6ec34d28860bc3384e447, stack: virgon, host: aquamagazine.com }
            ###############################################
            #^# Make sure this matches the site matrix! #^#
            ###############################################
        with:
          docker_image: ${{ vars.AWS_ECR_REGISTRY }}/${{ matrix.image_prefix }}-${{ matrix.site.host }}:${{ needs.version.outputs.version }}
          infra_stack: ${{ matrix.site.stack }}
          rancher_label_key: basecms-website
          rancher_label_val: ${{ matrix.image_prefix }}-${{ matrix.site.host }}
        secrets: inherit

    ```

4. Update the `deploy-production.yml` file:
    ```yml
    name: Deploy sites (production)

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
            [[ "$GITHUB_REF" =~ ^refs/tags.*$ ]] && VERSION="$REF" || VERSION="${REF}-${GITHUB_SHA::7}"
            echo "version=$VERSION" >> $GITHUB_OUTPUT
        outputs:
          version: ${{ steps.tag_version.outputs.version }}

      notify-start:
        needs: [version]
        uses: parameter1/actions/.github/workflows/notify-start.yml@main
        secrets: inherit
        with:
          version: ${{ needs.version.outputs.version }}

      post-deploy-failure:
        if: failure()
        needs: [notify-start, deploy-sites]
        uses: parameter1/actions/.github/workflows/notify-fail.yml@main
        secrets: inherit
        with:
          slack-thread: ${{ needs.notify-start.outputs.slack-thread }}

      post-deploy-complete:
        if: success()
        needs: [notify-start, deploy-sites]
        uses: parameter1/actions/.github/workflows/notify-complete.yml@main
        secrets: inherit
        with:
          slack-thread: ${{ needs.notify-start.outputs.slack-thread }}

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
            tenant_key: [abmedia_all]
            image_prefix: [ab-media]
            site:
              - { id: 60f6ec0bd28860bc3384daa1, stack: virgon, host: athleticbusiness.com }
              - { id: 60f6ec3bd28860bc3384e784, stack: virgon, host: woodfloorbusiness.com }
              - { id: 60f6ec34d28860bc3384e447, stack: virgon, host: aquamagazine.com }
            ###############################################
            #^# Make sure this matches the site matrix! #^#
            ###############################################
        with:
          ecr_registry: ${{ vars.AWS_ECR_REGISTRY }}
          docker_image: ${{ vars.AWS_ECR_REGISTRY }}/${{ matrix.image_prefix }}-${{ matrix.site.host }}:${{ needs.version.outputs.version }}
          site_id: ${{ matrix.site.id }}
          site_host: ${{ matrix.site.host }}
          infra_stack: ${{ matrix.site.stack }}
          tenant_key: ${{ matrix.tenant_key }}
          push: true
        secrets: inherit

      deploy-sites:
        needs: [version, build-sites]
        uses: parameter1/actions/.github/workflows/website-deploy-production.yml@main
        strategy:
          matrix:
            ###############################################
            #v# Make sure this matches the site matrix! #v#
            ###############################################
            tenant_key: [abmedia_all]
            image_prefix: [ab-media]
            site:
              - { id: 60f6ec0bd28860bc3384daa1, stack: virgon, host: athleticbusiness.com }
              - { id: 60f6ec3bd28860bc3384e784, stack: virgon, host: woodfloorbusiness.com }
              - { id: 60f6ec34d28860bc3384e447, stack: virgon, host: aquamagazine.com }
            ###############################################
            #^# Make sure this matches the site matrix! #^#
            ###############################################
        with:
          docker_image: ${{ vars.AWS_ECR_REGISTRY }}/${{ matrix.image_prefix }}-${{ matrix.site.host }}:${{ needs.version.outputs.version }}
          infra_stack: ${{ matrix.site.stack }}
          rancher_label_key: basecms-website
          rancher_label_val: ${{ matrix.image_prefix }}-${{ matrix.site.host }}
        secrets: inherit
    ```

## Stylelint
Linting styles via `stylelint` has been removed. The reasons are varied, but primarily version 10 is _really_ old and the bootstrap config preset isn't well-supported anymore.

### Action Items
1. Delete any `.stylelintrc.js`/`.stylelintignore` files -- these are normally in the root of the repository, but ensure no other files exist in site or package folders.
2. Check to see if you have `stylelint` installed as a dependency by searching the project for `"stylelint"`. If it appears in any of your project's `package.json` files, please remove the dependency and re-run `./scripts/yarn.sh`

## ESLint
The internal `eslint` version was upgrade from v5 to v8 -- quite a large jump -- and the supporting `eslint-plugin-import` and `eslint-config-airbnb-base` were also upgraded. As such, if you were relying on the eslint version provided by `base-cms` (most likely), you'll need to update your code to fix any lint errors.

### Action Items
1. Install the `@parameter1/base-cms-eslint` wrapper package and the browserslist config in the monorepo root.
    - In the root `package.json` add or update the following devDependencies:
    ```json
    "@parameter1/base-cms-eslint": "^4.1.0",
    "@parameter1/browserslist-config-base-cms": "^4.1.0",
    ```
    - You must **remove** _all_ `babel-eslint` packages, since `@babel/eslint-parser` is now used under the hood
    - Double-check your website and global package files and ensure there aren't any references to eslint or any of it's plugins - this way only the root version will be used.

2. Add the shared `browserslist` config to the root `package.json` file:
    ```json
    "browserslist": [
      "extends @parameter1/browserslist-config-base-cms"
    ]
    ```

3. Update the  `.eslintrc.js` found in the project root to use the common server config. Replace with:
    ```js
    module.exports = require('@parameter1/base-cms-eslint/eslintrc.server');
    ```

4. Update the root `eslint.browser.js` file to use the common browser config. Replace with:
    ```js
    // eslint-disable-next-line
    module.exports = require('@parameter1/base-cms-eslint/eslintrc.browser');
    ```

5. Because the new version of the vue plugin can support Vue3, we should also instruct any plugins as to our target Vue version. In the root of the repo create a `jsconfig.json` (if it doesn't exist) and add:
    ```json
    {
      "vueCompilerOptions": {
        "target": 2.7
      }
    }
    ```
6. Once the new devDependencies are added, run `./scripts/yarn.sh`
7. Restart VSCode (via `Cmd+Q`) so the new eslint library will load
8. Open to Docker terminal via `./scripts/terminal.sh` and then run `yarn lint:fix` from the root. This will attempt to fix lint errors automatically. If the lint fixer does encounter errors, you'll need to manually fix those, then run `yarn lint:fix` again.

## Global Package Upgrade & Final Items
1. Once all of the tasks above have been completed, run `./scripts/yarn.sh upgrade` to ensure all semver versions get normalized.
2. Run `yarn compile` from the project root to re-compile all marko templates
    - All marko files are compiled during testing. As such, if any components/templates contain references to missing components, you'll need to fix those errors before the tests will pass. For example, some sites had `spec-guide` templates pasted in from other repos that aren't actively used, etc.
3. Run `yarn test` from the project root to ensure tests pass
4. Then start a website container and ensure it builds, boots, and serves.

# CLI Timings
Tested inside Docker container on Mac using example website.

## Dev Server
- Initial boot
  - Legacy: ~1 minute
  - New: ~40 seconds
- Restart time after save of marko file
  - Legacy: ~34 seconds
  - New: ~9 seconds
- Restart time after save of browser JS file
  - Legacy: ~32 seconds
  - New: ~2 seconds
- Restart time after save of SSR file
  - Legacy: ~30 seconds
  - New: ~4 seconds
- Restart time after save of SCSS file
  - Legacy: ~32 seconds
  - New: ~3 seconds

## Production Build
- Legacy: ~34 seconds
- New: ~57 seconds
  - this will be _much_ faster in an actual website, since the example site needs to delete and re-compile _all_ marko templates in the entire base-cms repo, which wouldn't happen in a site repo.
