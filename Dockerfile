FROM node:current-alpine as build
WORKDIR /opt/app
ADD package*.json ./
RUN yarn install
ADD . .
RUN yarn build

FROM node:current-alpine
ENV NODE_ENV=production
WORKDIR /opt/app
COPY --from=build /opt/app/dist ./dist
ADD package*.json ./
RUN yarn install --production
CMD ["yarn", "start"]