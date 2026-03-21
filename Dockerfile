# Stage 1: Build frontend
FROM node:20-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY server/ ./server/
COPY --from=build /app/dist ./dist

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

CMD ["npx", "tsx", "server/src/index.ts"]
