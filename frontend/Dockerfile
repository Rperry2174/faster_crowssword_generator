# Multi-stage build for optimization
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY src/ ./src/
COPY public/ ./public/
COPY tsconfig.json ./
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Set default backend host environment variable
ENV BACKEND_HOST=backend

# Copy built files to nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration template
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]