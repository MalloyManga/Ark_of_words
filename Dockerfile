# syntax=docker/dockerfile:1

FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS build
COPY . .
RUN npm run build
RUN mkdir -p .output/server/node_modules/kuromoji \
    && cp -R node_modules/kuromoji/dict .output/server/node_modules/kuromoji/dict \
    && test -d .output/server/node_modules/kuromoji/dict

FROM node:22-alpine AS runtime
ENV NODE_ENV=production \
    NITRO_HOST=0.0.0.0 \
    NITRO_PORT=3000
WORKDIR /app
COPY --from=build --chown=node:node /app/.output ./.output
RUN mkdir -p /app/.data/cache && chown -R node:node /app/.data
USER node
EXPOSE 3000
VOLUME ["/app/.data"]
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:3000/api/health').then((response) => { if (!response.ok) process.exit(1) }).catch(() => process.exit(1))"
CMD ["node", ".output/server/index.mjs"]
