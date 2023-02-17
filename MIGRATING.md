# Migrating from 3.x to 4.x
- Ensure you have the latest 3.x version of the dependency upgrade tool installed globally
  - `yarn global add @parameter1/base-cms-dependency-tool@v3.27.0`
- Run the dependency tool and force the `--latest` version
  - `p1-basecms-dependencies upgrade --latest`
- Run yarn install _in the docker image_ via `./scripts/yarn.sh` or by `docker-compose run --rm --entrypoint yarn commands` from the project root
- Once the new packages are installed, some Babel versions may be mismatched -- delete all entries in `yarn.lock` that match regex `/^@babel\//` then re-run yarn install above
- Update browserslist entries via `npx browserslist@latest --update-db`
- Remove any references to components `<marko-web-deferred-script-loader-init />` and `<marko-web-deferred-script-loader-load />`. These are now included in core and do not need to be in the websites.
