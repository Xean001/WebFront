# Stage 1: Build
# Usar imagen base de Node.js para compilar la aplicación Angular
FROM node:20-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el código fuente
COPY . .

# Compilar la aplicación Angular para producción
RUN npm run build

# Stage 2: Production
# Usar imagen ligera de Nginx para servir la aplicación
FROM nginx:alpine

# Información del mantenedor
LABEL maintainer="Fadely Team"
LABEL description="Angular WebFront Application for Fadely Barbershop Management System"
LABEL version="1.0"

# Copiar configuración de Nginx personalizada
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar los archivos compilados del stage anterior
COPY --from=builder /app/dist/web-front /usr/share/nginx/html

# Exponer puerto
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]
