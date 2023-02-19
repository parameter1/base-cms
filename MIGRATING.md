# Migrating from 3.x to 4.x
- Recursively delete all node_modules using `find . -name 'node_modules' -type d -prune -exec rm -rf '{}' +` from the project root (outside docker and make sure docker is down, otherwise will be very slow and may crash if file is in use)
- Ensure you have the latest 3.x version of the dependency upgrade tool installed globally
  - `yarn global add @parameter1/base-cms-dependency-tool@v3.28.1`
- Update _all_ website `docker-compose.yml` and `Dockerfile` files to use `node:14.21` image
  - For GitHub actions, update the `node-version` in `.github/workflows/node-ci.yml` to `14.21`
- Run the dependency tool using the latest flag: `p1-basecms-dependencies upgrade --latest`
  - If trying to upgrade to a pre-release, also include the `--prereleases` flag
- Optional: you may want to clear your `node_modules` before running yarn: run `rm -rf node_modules` from the website root
- Run yarn install _in the new node:14 docker image_ via `./scripts/yarn.sh` or by `docker-compose run --rm --entrypoint yarn terminal` from the project root
  - `node-sass` may hang or error when compiling binaries in the final stage of the install. if this happens, delete any `yarn.lock` entries where `node-sass@` is less than 4.14.1 and re-install
- Once the new packages are installed, some Babel versions may be mismatched -- delete all entries in `yarn.lock` that match regex `/^"@babel\//` then re-run yarn install above
- Update browserslist entries via `npx browserslist@latest --update-db`
- Update relative node_module `@import` declarations in `.scss` files to their absolute counterparts. For example:
  - `@import "../../node_modules/bootstrap/scss/mixins"` would become `@import "bootstrap/scss/mixins";`
  - `@import "../../node_modules/@parameter1/base-cms-marko-web-theme-monorail/scss/core";` would become `@import "@parameter1/base-cms-marko-web-theme-monorail/scss/core";`
  - note: the number of relative parent paths does not matter... so `../` and `../../` and `../../../` etc all need to be removed.
  - the quickest way to fix this is with a find and replace in `.scss` files with the following regex: `@import ".*\/node_modules\/` and replace with an empty string.
- Remove any references to components `<marko-web-deferred-script-loader-init />` and `<marko-web-deferred-script-loader-load />`. These are now included in core and do not need to be in the websites.
- Each website's `yarn dev` and `yarn build` scripts _should_ still work as expected, as the new CLI assumes that marko templates need to be compiled from `../packages` (assuming a standard site working directory of `sites/domain.com`). If this needs to be adjusted, change the site's `dev` script `--compile-dir` option
- Marko files from `@parameter1 `packages (found in `node_modules`) are now compiled on build/publish. As such the compiled files will already exist in `node_modules`. As such, there's not need to watch or compile `node_modules` packages. The drawback is that you _cannot_ directly change `.marko` files found in `node_modules` without re-compiling the changed file.

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

5. Once the new devDependencies are added, run `./scripts/yarn.sh`
6. Restart VSCode so the new eslint library will load
7. Run the global `lint` command and fix any new lint errors. Generally you'll find errors related to missing parenthesis around function args, but there will be others

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

