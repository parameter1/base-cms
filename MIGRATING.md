# Migrating from 3.x to 4.x

## Prerequisites
Before following the migration steps, make sure the following have been completed.

1. Ensure you have the latest _3.x_ depenency tool installed _globally_. To do so, run the following command:
    ```bash
    yarn global add @parameter1/base-cms-dependency-tool@v3.28.1
    ```

2. Down any running Docker containers in your project by running the following from the project root
    ```bash
    docker-compose down
    ```

3. It's **highly recommended** that you recursively delete _all_ `node_modules` folders
    ```bash
    find . -name 'node_modules' -type d -prune -exec rm -rf '{}' +
    ```

## Upgrade Docker Node images from 10 to 14

### Action Items
1. References to `node:10` images (specifically, `node:10.24`) should be changed to `node:14.21` in _all_ files named
- `docker-compose.yml`
- `Dockerfile`

2. If GitHub actions are used by the repo, the `node-version` value must be changed to `14.21` in the `.github/workflows/node-ci.yml` file. If TravisCI is still used, check the `.travis` file in the root of the project and update the node version.

## Lerna

### Action Items
Upgrade `lerna` to the latest major version in your root `package.json` file
```json
"lerna": "^6.5.1"
```

## BaseCMS Dependencies
All core `@parameter1/base-cms-*` dependencies will need to be upgraded to the latest versions. Additionally, because lower-level dependencies (such as `@babel/*` and `node-sass`) had significant version adjustments, references to these should be deleted from the `yarn.lock` before running an install.

### Action Items
1. Upgrade all BaseCMS dependencies to v4.x by running the below in the project root
    ```bash
    p1-basecms-dependencies upgrade --latest --prelreases
    ```

2. Once completed, _do not_ run a `yarn install` yet. We'll save that to the very end. :)
3. Delete references to `@babel/*` dependencies in the `yarn.lock` file. The easiest way to do this is to search in the file using regex `^"@babel\/` and then delete all entries. There may be _alot_ of these, and that's okay :)
4. Delete references to `node-sass` in the `yarn.lock` file. Search using regex `^node-sass` and any entries
4. Now run `./scripts/yarn.sh` -- this should run in the new Node14 Docker container (which may need to be downloaded). **MAKE SURE YOU RUN THE INSTALL USING THE SCRIPT** This ensures the install runs in the proper version of Node.

## SASS/SCSS Updates
The new build process will no longer resolve relative `@import` statements to files located in `node_modules`. The good news, however, is that it _can_ import using standard package names.

### Action Items
1. Update relative node_module `@import` declarations in `.scss` files to their absolute counterparts. For example:
  - `@import "../../node_modules/bootstrap/scss/mixins"` would become `@import "bootstrap/scss/mixins";`
  - the number of relative parent paths does not matter... so `../` and `../../` and `../../../` etc all need to be removed.
2. The quickest way to change the import statements is to search all `.scss` files using regex `@import ".*\/node_modules\/` and replacing the matched entries with an empty string.

## Component Changes
The `marko-web-deferred-script-loader` is now loaded into core. As such, certain component calls can be removed.

### Action Items
1. Remove any references to components `<marko-web-deferred-script-loader-init />` and `<marko-web-deferred-script-loader-load />`. These normally occur in the site or global `document.marko` file.

## Improved CLI and Build/Serve Commands
While the CLI was significantly improved for performance, each website's `yarn dev` and `yarn build` scripts _should_ still work as expected. This due to the new CLI assuming that `../../packages` (relative from the `sites` directory) has Marko templates that need compiling. If this needs to be adjusted, change the site's `dev` script `--compile-dir` option

Note: Marko files from `@parameter1/base-cms-*` packages (found in `node_modules`) are now compiled on build/publish. As such the compiled files will already exist in `node_modules` when they are installed, and are not automatically compiled by the new CLI. The drawback to this is that you can no longer directly change `.marko` files found in `node_modules` without re-compiling manually. More to follow on this topic at a later time.

### Action Items
1. It is recommended to change `package.json` compile scripts to `"compile": "basecms-marko-compile compile"`. While the old scripts will still work, this will cleanup cli options that are no longer used.
2. It is recommended to update any `package.json` test sripts that include `yarn compile` to add the `--no-clean` option. This will make test runs faster since the marko file will not be deleted before compiling. For example `"test": "yarn compile --no-clean && yarn lint"`

## Stylelint
Linting styles via `stylelint` has been removed. The reasons are varied, but primarily version 10 is _really_ old and the bootstrap config preset isn't well-supported anymore.

### Action Items
1. If any of the websites or global/core packages in your repository have a `lint:css` script or `.stylelintrs.js`/`.stylelintignore` files, the scripts should be removed/updated and the files should be deleted. This will prevent linting errors now that stylelint is removed.
2. If you also have `stylelint` installed as a dependency in your repository (either in the root monorepo `package.json` file or in any sites/packages) please remove the dependency and re-run `./scripts/yarn.sh`

## ESLint
The internal `eslint` version was upgrade from v5 to v8 -- quite a large jump -- and supporting the support `eslint-plugin-import` and `eslint-config-airbnb-base` were also uopgraded. As such, if you were relying on the eslint version provided by `base-cms` (most likely), you'll need to update your code to fix any lint errors.

In addition, the web, newsletter, and export CLIs no longer provides a `lint` command. Most commands were _not_ using this command directly, and instead were running `eslint` directly in their package.json `lint` scripts. But this will need to be verified

### Action Items
1. Verify that none of your package.json `lint` scripts reference the `basecms-website lint` comamnd. If they do, change them appropriately, usually `eslint --ext .js --ext .vue --max-warnings 5 --ignore-path ../../.eslintignore ./`
- Also note the stylelint changes above -- `lint:css` scripts should be removed and the old `lint:js` script should _become_ the new `lint` script with the eslint command above.

2. Install `eslint` (along with plugins and configs) in the monorepo root. Existing core configurations and browser config files should still work and do not need to change.
- In the root `package.json` add or update the following devDependencies: (**note:** newsletter and export repos do _not_ need `babel-eslint` or `eslint-plugin-vue`)
  ```json
  "@babel/eslint-parser": "^7.19.1",
  "eslint": "^8.34.0",
  "eslint-config-airbnb-base": "^15.0.0",
  "eslint-plugin-import": "^2.27.5",
  "eslint-plugin-vue": "^9.9.0",
  ```
- You must remove _all_ `babel-eslint` packages, since `@babel/eslint-parser` is now used.
- Double-check your website and global package files and ensure there aren't any references to eslint or any of it's plugins - this way only the root versions will be used.

3. Update `babel-eslint` references on `.eslintrc.js` config files. The fastest way is to search for `parser: 'babel-eslint'`. If your repo isn't already using a common/shared browser eslint file that's imported into each `browser` we recommend creating one.
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
4. The `vue/max-attributes-per-line` rule options changed in the latest version and needs to be updated. Additionally, the `vue/multi-word-component-names` should be turned off.
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

5. Because the new version of the vue plugin can support Vue3, we should also instruct any plugins as to our target Vue version. In the root of the repo create a `jsconfig.json` (if it doesn't exist) and add:
    ```json
    {
      "vueCompilerOptions": {
        "target": 2.7
      }
    }
    ```
5. Once the new devDependencies are added, run `./scripts/yarn.sh`
6. Restart VSCode so the new eslint library will load
7. Run the global `lint` command and fix any new lint errors. Generally you'll find errors related to missing parenthesis around function args, but there will be others.
  - ProTip: add a `"lint:fix": "yarn lint --fix"` script to each website and global package's `package.json` file. Then add `"lint:fix": "lerna run lint:fix"` to the root package.json. That way, you can run `yarn lint:fix` from the root, which will lint and also try to fix all errors for you!
  - If the lint fixer does encounter errors, you'll need to manually fix those, then run `yarn lint:fix` again.

## Global Package Upgrade
Once all of the tasks above have been completed, run `./scripts/yarn.sh upgrade` to ensure all semver versions get normalized.

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

