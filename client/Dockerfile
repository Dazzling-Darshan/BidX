# Stage 1: Build static bundle with Vite
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build arguments for API & Socket URLs (defaults to localhost:4000)
ARG VITE_API=http://localhost:4000/api
ARG VITE_SOCKET_URL=http://localhost:4000
ENV VITE_API=$VITE_API
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

# Build production distribution
RUN npm run build

# Stage 2: Serve with lightweight Nginx
FROM nginx:alpine

# Copy built static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
