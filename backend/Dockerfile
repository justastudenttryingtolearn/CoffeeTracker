# ---- Build stage ----
FROM node:22-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# ---- Production stage ----
FROM node:22-slim AS runner

WORKDIR /app

# Only copy production deps
COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

# data/ directory will be mounted from Azure File Share at runtime
RUN mkdir -p /mnt/data

ENV NODE_ENV=production
ENV PORT=8080
ENV DB_PATH=/mnt/data/coffee.db

EXPOSE 8080

CMD ["node", "dist/index.js"]

