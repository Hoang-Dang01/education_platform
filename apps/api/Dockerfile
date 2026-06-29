# Stage 1: Build the NestJS Application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace configuration and packages
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/api ./apps/api

# Install dependencies for the workspace
RUN npm ci

# Generate Prisma Client
WORKDIR /app/apps/api
RUN npx prisma generate

# Build the API
WORKDIR /app
RUN npm run build:api

# Stage 2: Production environment to run the API
FROM node:20-alpine

WORKDIR /app

# Copy configuration and packages for runtime
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/api/package.json ./apps/api/
COPY apps/api/prisma ./apps/api/prisma

# Install production dependencies only
RUN npm ci --omit=dev

# Generate Prisma client for runtime
WORKDIR /app/apps/api
RUN npx prisma generate

# Copy built code from builder
COPY --from=builder /app/apps/api/dist ./dist

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
