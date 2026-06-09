# ===== Stage 1: Build =====
# Use Node to build the React app into static files
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Build creates an optimized /app/build folder
RUN npm run build

# ===== Stage 2: Serve =====
# Use Nginx (lightweight web server) to serve the static files
# This is a "multi-stage build" — final image has NO Node.js, much smaller
FROM nginx:alpine

# Copy built files from Stage 1 into Nginx's web root
COPY --from=builder /app/build /usr/share/nginx/html

# Custom Nginx config to handle React Router (single-page app)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
