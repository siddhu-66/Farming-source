FROM node:22-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-workspace.yaml* pnpm-lock.yaml* turbo.json* ./
COPY apps/web/package.json ./apps/web/package.json
RUN pnpm install --filter @agriassist/web...
COPY apps/web ./apps/web
# Set environment variables for production build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN pnpm run build --filter @agriassist/web

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Copy necessary files
# Next.js standalone output is highly recommended for Docker.
# If standalone is not enabled in next.config.ts, this will copy the standard build.
COPY --from=builder /app/apps/web/package.json ./package.json
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/node_modules ./apps/web/node_modules

EXPOSE 3000
# Run the Next.js server
CMD ["node", "node_modules/.bin/next", "start"]
