# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Argomento per API URL (può essere passato al build)
ARG API_URL=http://localhost:8000/api/v1

# Copia package files
COPY package*.json ./
RUN npm ci

# Copia sorgenti
COPY . .

# Sostituisci API_URL nell'environment.prod.ts
# Sostituisce qualsiasi URL con quello passato come build arg
RUN if [ -n "$API_URL" ]; then \
      sed -i "s|apiUrl:.*|apiUrl: '${API_URL}'|g" src/environments/environment.prod.ts; \
    fi

# Build
RUN npm run build

# Production stage
FROM nginx:alpine

# Copia i file buildati (Angular 17+ mette i file in dist/foodworks-dashboard/browser)
COPY --from=builder /app/dist/foodworks-dashboard/browser /usr/share/nginx/html

# Copia configurazione nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

