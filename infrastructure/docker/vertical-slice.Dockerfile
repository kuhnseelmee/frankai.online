FROM node:24.18.0-bookworm-slim@sha256:6f7b03f7c2c8e2e784dcf9295400527b9b1270fd37b7e9a7285cf83b6951452d AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

FROM dependencies AS build
COPY tsconfig.json tsconfig.services.json ./
COPY services ./services
COPY packages ./packages
COPY agents ./agents
RUN npm run build:services

FROM node:24.18.0-bookworm-slim@sha256:6f7b03f7c2c8e2e784dcf9295400527b9b1270fd37b7e9a7285cf83b6951452d AS runtime
ARG SERVICE
ENV NODE_ENV=production
ENV SERVICE=${SERVICE}
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY --from=build /app/agents/frank-core/prompt.md ./agents/frank-core/prompt.md
COPY infrastructure/docker/vertical-slice-entrypoint.sh /usr/local/bin/vertical-slice-entrypoint
RUN chmod 0555 /usr/local/bin/vertical-slice-entrypoint
USER root
EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/vertical-slice-entrypoint"]
CMD ["sh", "-c", "exec node dist/services/${SERVICE}/src/server.js"]
