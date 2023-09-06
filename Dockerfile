FROM node:current-alpine

ENV NODE_ENV=production

RUN mkdir -p /app/dist
WORKDIR /app

COPY package.json ./

RUN yarn --production

COPY /dist /app/dist

CMD [ "yarn", "start" ]