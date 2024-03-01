FROM node:current-alpine as build
ENV NODE_ENV=production
WORKDIR /opt/app
ADD package*.json ./
RUN yarn --production
ADD . .
RUN yarn build

FROM node:current-alpine
ENV NODE_ENV=production
WORKDIR /opt/app
COPY --from=build /opt/app/dist ./dist
ADD package*.json ./
RUN yarn --production
CMD ["yarn", "start"]