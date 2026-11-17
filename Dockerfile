# Multi-stage build for Barangay Bugo Resident Assistance Management System
# Optimized for Firebase Cloud Run deployment

# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build frontend and backend
RUN npm run build

# Stage 2: Production
FROM node:22-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy Prisma schema for runtime
COPY prisma ./prisma

# Generate Prisma client in production image
RUN npx prisma generate

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist

# Copy necessary runtime files
COPY scripts ./scripts

# Create logs directory
RUN mkdir -p logs

# Cloud Run sets PORT environment variable
ENV NODE_ENV=production

# Expose port (Cloud Run will override this)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); })"

# Start application
CMD ["npm", "start"]
