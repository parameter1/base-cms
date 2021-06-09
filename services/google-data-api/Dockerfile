FROM node:10.24
ENV NODE_ENV production
ADD ./ /base-cms
WORKDIR /base-cms

RUN yarn --production --frozen-lockfile

WORKDIR /base-cms/services/google-data-api
ENTRYPOINT [ "node", "src/index.js" ]
