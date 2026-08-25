FROM node:22-alpine AS builder
# Set working directory
WORKDIR /app
# Install pnpm
RUN npm install -g pnpm
# Copy root package.json and turbo.json
COPY package.json pnpm-workspace.yaml* pnpm-lock.yaml* turbo.json* ./
# Copy the api app package.json
COPY apps/api/package.json ./apps/api/package.json
# Install dependencies
RUN pnpm install --filter @agriassist/api...
# Copy the rest of the source code
COPY apps/api ./apps/api
# Build the api
RUN pnpm run build --filter @agriassist/api

FROM node:22-alpine AS runner
WORKDIR /app
RUN npm install -g pnpm
COPY --from=builder /app/apps/api/package.json ./package.json
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
# For production
ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000
CMD ["node", "dist/server.js"]
