# BaseCMS
[![Travis (.com) branch](https://img.shields.io/travis/com/parameter1/base-cms/master?label=TravisCI)](https://travis-ci.com/github/parameter1/base-cms)
[![GitHub Workflow Status (CodeQL)](https://img.shields.io/github/workflow/status/parameter1/base-cms/CodeQL/master?label=CodeQL)](https://github.com/parameter1/base-cms/actions/workflows/codeql-analysis.yml)
[![Github lerna version](https://img.shields.io/github/lerna-json/v/parameter1/base-cms)](./lerna.json)

### Table of Contents
- [Overview](#overview)
  - [Requirements](#requirements)
  - [Additional Resources](#additional-resources)
- [Contributing](#contributing)
  - [Style Guide](#style-guide)
  - [Deployments](#deployments)
- [Usage](#usage)
  - [Running Services](#running-services)
  - [Adding/Removing Dependencies](#addingremoving-dependencies)
  - [Yarn](#yarn)
  - [Terminal Access](#terminal-access)

## Overview
This monorepo contains the services and packages to support the BaseCMS ecosystem.

### Requirements

This repository uses [Docker Compose](https://docs.docker.com/compose/overview/) (minmum Docker version 18.06.0). The best way to get Docker is to install [Docker Desktop](https://www.docker.com/products/docker-desktop) -- [see this](https://github.com/parameter1/base-platform/wiki/Docker-&-Kitematic) for a high level overview of using Docker and Compose for development.

Docker Compose provides a homogenous build and development environment across all platforms, meaning code and dependencies run the same developing on Linux, MacOS, and Windows, and match the same environment used in production.

Additionally, we recommend the following tools/utilities:
- [VSCode](https://code.visualstudio.com/) - a modular IDE
- [Tower](https://www.git-tower.com) - a Git GUI client
- [Robo 3T](https://robomongo.org) - a MongoDB GUI
- [Insomnia](https://insomnia.rest) - a REST client
- [GraphQL Playground](https://github.com/prisma/graphql-playground) - a GraphQL client

### Additional Resources
- [MarkoJS](https://markojs.com/docs/getting-started/) - Server-side templates are rendered using the Marko templating engine
- [VueJS](https://vuejs.org) - Client-side component templating
- [ExpressJS](https://expressjs.com) - The backend HTTP server handling routing for requests
- [Lerna](https://github.com/lerna/lerna) - Used for versioning and managing of sub-packages within the repository
- [Bootstrap v4](https://getbootstrap.com) - A subset of BSv4 is used for the styling within the Pennwell theme, and custom component development should use available mixins and variables -- See [Common components](#common-components)


## Contributing
- All contributions must be submitted as pull requests to this repository, and reviewed by a repository owner before being merged.
- All status checks must pass, and all commits must have an approving review.
- All package versioning must be done via the [@lerna/lerna](https://github.com/lerna/lerna) script included at `./scripts/lerna.sh`.

### Style Guide
- Marko
  - All Marko templating should be done using the standard syntax (`<h1>Hello World</h1>`) instead of concise (`h1 -- Hello World`) syntax.
  - All arguments should be dasherized and use double quotes `<component argument-name="argument-value" />`
  - Components without an explicit inner body should be self closing (`<component />` instead of `<component> ... </component>`)
  - Components _should_ be defined as reusable components (under `packages/global`), if re-used.
    - Certain components or templates cannot be reused due to needing custom ad or content definitions from outside of their scope (for example, the website-section site template vs the website-section pennwell theme layout).
- VueJS
  - Vue components should use the concise syntax available for binding properties and methods:
    - Use `<div :value="prop" />` instead of `<div v-bind:value="prop" />`.
    - Use `<div @click="handler" />` instead of `<div v-on:click="handler" />`.
  - Direct jQuery access should be avoided if at all possible. Explore alternative solutions using Vue architecture or vanilla Javascript before bringing in jQuery to implement a feature -- especially true of any jQuery plugins.
- Express
  - Middleware should be used in favor of individual route definitions
- General Javascript
  - All JS filenames should be dasherized
  - All project linting rules should be followed (see ESLint at project root).
  - While all ES6 code will be transpiled for the browser accessing it at run-time, beware of any potential deprecations that are not included in the transpilation.
    - Utilize [CanIUse](https://caniuse.com) to check targeted browser support for native JS and CSS methods.
    - If an additional polyfill is required, make sure the [loader](https://github.com/parameter1/base-cms/blob/master/packages/marko-web/src/components/document/index.marko#L11) is updated to reflect this.
- General
  - All files should have a new line at the end [VSCode](https://stackoverflow.com/a/44704969/2195565)
  - Ensure trailing whitespace is trimmed from each line [VSCode](https://stackoverflow.com/a/30884298/2195565)
  - All files should be indented with two spaces [VSCode](https://stackoverflow.com/a/38556923/2195565)
  - All files and folders should use dasherized names (`my-package` rather than `myPackage` or `MyPackage`.)

### Deployments
- Deployments to production infrastructure are performed via [Travis CI](https://travis-ci.org/parameter1/base-cms/builds), and occur only when a release is tagged.
- Each site is versioned independently, and the build process results in an individual docker container, hosted on [Docker Hub](https://hub.docker.com/u/parameter1).
  - If there are no changes in a site, a version will not be published, nor will the site be deployed
- The deployment configuration is located in [.travis.yml](.travis.yml), and specifies the site directory and [infrastructure stack](https://rancher.parameter1.com/c/c-njflm/projects-namespaces).
- This deployment script utilizes the site package.json version (provided by lerna on tag) and the DockerHub API to determine if a build should happen.
- If a build is triggered, the deployment script deploys the new Docker image to the production infrastructure using the [@endeavorb2b/rancher2cli](https://github.com/base-cms/rancher2cli) CLI.

----

## Usage

1. Clone the repository
2. From the project root run `scripts/install.sh` to install dependencies

### Running Services
From the project root, run `scripts/run.sh [SERVICE_NAME]`. For example, to run the dev environment for `graphql-server` run `scripts/run.sh graphql-server`

Available services include:
- `graphql-server`
- `example-website`
- `keyword-analysis`

To bring down all services (and service deps) run `scripts/down.sh`.

### Adding/Removing Dependencies
This repository uses Yarn workspaces for managing packages and services.
- To add dependencies to a workspace run `scripts/workspace.sh [WORKSPACE_NAME] add [package]`
- To remove dependencies from a workspace run `scripts/workspace.sh [WORKSPACE_NAME] remove [package]`

The `WORKSPACE_NAME` is equivalent to the `name` field found in the `package.json` file of the package or service. For example, to add a package to the `graphql-server` service, run `scripts/workspace.sh @parameter1/base-cms-graphql-server add [package]`

### Yarn
Do _NOT_ run Yarn from your local machine. Instead run Yarn commands using `scripts/yarn.sh [command]`


### Terminal Access
To access the terminal inside Docker run `scripts/terminal.sh`
