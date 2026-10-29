# One image for the API (with the media server inside it) and one for the web
# server that serves the static bundle and proxies /api to the API, so the
# page, the API and the sockets share one origin and there is no CORS.
#
#   docker build --target app   -t standin-app .
#   docker build --target proxy -t standin-proxy .

FROM node:26-slim AS build
# Python and a C++ toolchain are only used when no prebuilt media worker exists
# for the platform, in which case mediasoup builds its own on install.
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm@11.3.0
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
# The page reaches the API through the same origin, under /api.
ENV VITE_BASE_API_URL=/api
# The build tells which commit it came from. The .git folder is not in the
# context, so the commit comes in as an argument:
#   docker build --build-arg APP_COMMIT=$(git rev-parse --short HEAD) ...
ARG APP_COMMIT=""
ARG APP_COMMIT_TIME=""
ENV VITE_APP_COMMIT=$APP_COMMIT
ENV VITE_APP_COMMIT_TIME=$APP_COMMIT_TIME
RUN pnpm build

FROM node:26-slim AS app
RUN npm install -g pnpm@11.3.0
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app /app
COPY deploy/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
# The API reads and writes uploads under apps/api/public. Keep it on a volume.
VOLUME ["/app/apps/api/public"]
EXPOSE 3001
ENTRYPOINT ["entrypoint.sh"]

FROM caddy:2 AS proxy
COPY --from=build /app/apps/web/dist /srv/web
COPY deploy/Caddyfile /etc/caddy/Caddyfile
