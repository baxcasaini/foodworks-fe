# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copia package files
COPY package*.json ./
RUN npm ci

# Copia sorgenti e build
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copia i file buildati
COPY --from=builder /app/dist/foodworks-dashboard /usr/share/nginx/html

# Copia configurazione nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

