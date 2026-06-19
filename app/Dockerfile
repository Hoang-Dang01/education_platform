# Stage 1: Build the React Application
FROM node:20-alpine AS builder

WORKDIR /app

# Add build arguments for Vite configuration (để docker-compose truyền IP/port khi build)
ARG VITE_JITSI_HOST
ARG VITE_JITSI_PORT
ENV VITE_JITSI_HOST=$VITE_JITSI_HOST
ENV VITE_JITSI_PORT=$VITE_JITSI_PORT


# Copy dependency definitions
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:stable-alpine

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
