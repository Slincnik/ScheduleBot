FROM node:lts-alpine as base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable


RUN mkdir /app
WORKDIR /app

COPY . /app

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile --ignore-scripts

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules

CMD ["pnpm", "start"]