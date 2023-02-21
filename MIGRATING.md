# Migrating from 3.x to 4.x

## Prerequisites
Before following the migration steps, make sure the following have been completed.

1. Select the target website or newsletter repo to upgrade and pull all latest changes from `master`/`main`.
2. Create a new branch called `4.x` and push it to your fork. This is where all changes will be pushed to.
3. Ensure you're only loading _one_ repo into VSCode at a time.

4. Ensure you have the latest depenency tool installed _globally_. To do so, run the following command:
    ```bash
    yarn global add @parameter1/base-cms-dependency-tool@v4.0.0
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
4. Delete references to `node-sass` in the `yarn.lock` file. Search using regex `^node-sass` and any entries
4. Now run `./scripts/yarn.sh` -- this should run in the new Node14 Docker container (which may need to be downloaded). **MAKE SURE YOU RUN THE INSTALL USING THE SCRIPT** This ensures the install runs in the proper version of Node.
    - Note: if you're doing this migration while 4.x is still in pre-release, you'll likely see Yarn wranings about incorrect peer dependencies (e.g. `has incorrect peer dependency "@parameter1/base-cms-marko-web@^4.0.0"`) -- this is fine and will be resolved once the packages are out of pre-release.

## SASS/SCSS Updates
The new build process will no longer resolve relative `@import` statements to files located in `node_modules`. The good news, however, is that it _can_ import using standard package names.

### Action Items
1. Update relative node_module `@import` declarations in `.scss` files to their absolute counterparts. For example:
    - `@import "../../node_modules/bootstrap/scss/mixins"` would become `@import "bootstrap/scss/mixins";`
    - the number of relative parent paths does not matter... so `../` and `../../` and `../../../` etc all need to be removed.
2. The quickest way to change the import statements is to search all `.scss` files using regex `@import ".*\/node_modules\/` and replacing the matched entries with `@import "` (note the ending double-quote -- that should be there)

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
      "lint": "eslint --ext .js --ext .vue --max-warnings 5 --ignore-path ../../.eslintignore ./",
      "lint:fix": "yarn lint --fix",
      "test": "yarn lint && yarn compile --no-clean"
    }
    ```

2. Update the package scripts found in `./packages/*/package.json` files with the following:
    ```json
    "scripts": {
      "compile": "basecms-marko-compile compile",
      "build": "yarn compile",
      "lint": "eslint --ext .js --ext .vue --max-warnings 5 --ignore-path ../../.eslintignore ./",
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
4. The root `Dockerfile` will need updated to properly build the sites in production. In additon to changing the Node version to `14.24` ([see the section concerning Node versions above](#upgrade-docker-node-images-from-10-to-14)) the build commands should be adjusted as follows:
    ```diff
    - RUN yarn --production --pure-lockfile
    + RUN yarn --pure-lockfile
    
    - WORKDIR /root/sites/$SITE
    - RUN node_modules/.bin/basecms-website build
    + RUN yarn build
    ```
    - This will run the `build` script found in each website (js/css/ssr/marko) and each package (compiles Marko files)

5. Verify that the sites in `docker-compose.yml` are using `yarn dev` as their entrypoint and command. Some sites run the `basecms-website` command directly. Replace the `x-site-command` entry with the following:
    ```Dockerfile
    x-site-command: &site-cmd
      <<: *node
      entrypoint: ["yarn"]
      command: ["dev"]
    ```

## Stylelint
Linting styles via `stylelint` has been removed. The reasons are varied, but primarily version 10 is _really_ old and the bootstrap config preset isn't well-supported anymore.

### Action Items
1. Delete any `.stylelintrc.js`/`.stylelintignore` files -- these are normally in the root of the repository, but ensure no other files exist in site or package folders.
2. Check to see if you have `stylelint` installed as a dependency by searching the project for `"stylelint"`. If it appears in any of your project's `package.json` files, please remove the dependency and re-run `./scripts/yarn.sh`

## ESLint
The internal `eslint` version was upgrade from v5 to v8 -- quite a large jump -- and the supporting `eslint-plugin-import` and `eslint-config-airbnb-base` were also upgraded. As such, if you were relying on the eslint version provided by `base-cms` (most likely), you'll need to update your code to fix any lint errors.

### Action Items
1. Install `eslint` (along with plugins and configs) in the monorepo root. Existing core configurations should still work and do not need to change. That said, browser/vue configurations _will_ need changes.
    - In the root `package.json` add or update the following devDependencies: (**note:** newsletter and export repos do _not_ need `@babel/core`, `@babel/eslint-parser` or `eslint-plugin-vue`)
    ```json
    "@babel/core": "^7.21.0",
    "@babel/eslint-parser": "^7.19.1",
    "eslint": "^8.34.0",
    "eslint-config-airbnb-base": "^15.0.0",
    "eslint-plugin-import": "^2.27.5",
    "eslint-plugin-vue": "^9.9.0",
    ```
    - You must remove _all_ `babel-eslint` packages, since `@babel/eslint-parser` is now used.
    - Double-check your website and global package files and ensure there aren't any references to eslint or any of it's plugins - this way only the root versions will be used.

2. Update `babel-eslint` references on `.eslintrc.js` config files. The fastest way is to search for `parser: 'babel-eslint'`. If your repo isn't already using a common/shared browser eslint file that's imported into each `browser` we recommend creating one.
    - Replace
      ```js
      parserOptions: {
        parser: 'babel-eslint',
      },
      ```
    - With this (**Note** the move of `parser` to the root config, which uses the vue parser first)
      ```js
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@babel/eslint-parser',
        requireConfigFile: false,
      },
      ```
3. The `vue/max-attributes-per-line` rule options changed in the latest version and needs to be updated. Additionally, the `vue/multi-word-component-names` should be turned off.
    - Replace
      ```js
      'vue/max-attributes-per-line': ['error', {
        singleline: 3,
        multiline: {
          max: 1,
          allowFirstLine: false,
        },
      }],
      ```
    - With this
      ```js
      'vue/max-attributes-per-line': ['error', {
        singleline: {
          max: 3,
        },
        multiline: {
          max: 1,
        },
      }],
      'vue/multi-word-component-names': 'off',
      ```

4. Because the new version of the vue plugin can support Vue3, we should also instruct any plugins as to our target Vue version. In the root of the repo create a `jsconfig.json` (if it doesn't exist) and add:
    ```json
    {
      "vueCompilerOptions": {
        "target": 2.7
      }
    }
    ```
5. Once the new devDependencies are added, run `./scripts/yarn.sh`
6. Restart VSCode (via `Cmd+Q`) so the new eslint library will load
7. Open to Docker terminal via `./scripts/terminal.sh` and then run `yarn lint:fix` from the root. This will attempt to fix lint errors automatically. If the lint fixer does encounter errors, you'll need to manually fix those, then run `yarn lint:fix` again.

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
