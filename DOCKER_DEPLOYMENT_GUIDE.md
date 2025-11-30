# 🐳 Guía de Despliegue con Docker - Fadely WebFront

## 📋 Requisitos Previos

- Docker 20.10 o superior
- Docker Compose 2.0 o superior (opcional)
- Node.js 18 (para desarrollo local)
- Git

### Instalación de Docker

**Windows/Mac:**
```bash
# Descargar desde: https://www.docker.com/products/docker-desktop
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo usermod -aG docker $USER
```

---

## 🚀 Despliegue Rápido

### Opción 1: Script de Despliegue (Recomendado)

```bash
# Hacer ejecutable el script
chmod +x deploy.sh

# Flujo completo (build + run + health check)
./deploy.sh full

# Comandos individuales
./deploy.sh build      # Solo construir imagen
./deploy.sh run        # Solo iniciar contenedor
./deploy.sh logs       # Ver logs
./deploy.sh health     # Verificar salud
./deploy.sh stop       # Detener contenedor
./deploy.sh remove     # Remover contenedor
```

### Opción 2: Docker Compose

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f webfront

# Detener servicios
docker-compose down

# Reconstruir imagen
docker-compose up -d --build
```

### Opción 3: Comandos Docker Directos

```bash
# Construir imagen
docker build -t fadely/webfront:latest .

# Ejecutar contenedor
docker run -d \
  --name fadely-webfront \
  -p 80:80 \
  -v ./nginx.conf:/etc/nginx/nginx.conf:ro \
  --restart unless-stopped \
  fadely/webfront:latest

# Ver logs
docker logs -f fadely-webfront

# Detener contenedor
docker stop fadely-webfront

# Remover contenedor
docker rm fadely-webfront
```

---

## 📁 Estructura de Despliegue

```
WebFront/
├── Dockerfile              # Configuración multi-stage
├── docker-compose.yml      # Orquestación de servicios
├── nginx.conf              # Configuración de Nginx
├── .dockerignore           # Archivos a ignorar en imagen
├── deploy.sh               # Script de despliegue
├── package.json            # Dependencias Node.js
├── angular.json            # Configuración Angular
└── src/                    # Código fuente
    └── main.ts
```

---

## 🏗️ Arquitectura de Construcción

### Stage 1: Builder (Multistage Build)
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
```

**Resultado:** Aplicación compilada en `/app/dist/web-front`

### Stage 2: Production
```dockerfile
FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist/web-front /usr/share/nginx/html
EXPOSE 80
```

**Resultado:** Imagen optimizada ~50MB (sin incluir node_modules)

---

## ⚙️ Configuración de Nginx

El archivo `nginx.conf` incluye:

### ✅ Características de Seguridad
```nginx
# Security headers
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Content-Security-Policy "default-src 'self' https:";
```

### ✅ Optimización de Rendimiento
```nginx
# Gzip compression
gzip on;
gzip_comp_level 6;

# Caching
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

### ✅ API Proxy
```nginx
location /api/ {
    proxy_pass https://api.fadely.me;
    # Headers, timeouts, buffering...
}
```

### ✅ Enrutamiento SPA
```nginx
location / {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;
}
```

---

## 🔍 Verificación de Despliegue

### 1. Verificar que el contenedor está corriendo
```bash
docker ps --filter "name=fadely-webfront"
```

### 2. Ver logs
```bash
docker logs fadely-webfront
```

### 3. Verificar salud
```bash
docker inspect fadely-webfront --format='{{.State.Health}}'
```

### 4. Acceder a la aplicación
```bash
# En navegador
http://localhost

# Con curl
curl -I http://localhost/
```

### 5. Verificar endpoint de health
```bash
curl http://localhost/health
```

---

## 📊 Monitoreo y Logs

### Ver logs en tiempo real
```bash
docker logs -f fadely-webfront
```

### Ver logs de Nginx
```bash
docker exec fadely-webfront tail -f /var/log/nginx/access.log
docker exec fadely-webfront tail -f /var/log/nginx/error.log
```

### Ver estadísticas del contenedor
```bash
docker stats fadely-webfront
```

### Acceder a shell del contenedor
```bash
docker exec -it fadely-webfront sh
```

---

## 🌍 Despliegue en Producción

### 1. Preparar servidor Linux
```bash
# Actualizar sistema
sudo apt-get update && sudo apt-get upgrade -y

# Instalar Docker
sudo apt-get install docker.io docker-compose -y

# Configurar sudoers
sudo usermod -aG docker $USER

# Relogin o:
newgrp docker
```

### 2. Clonar repositorio
```bash
cd /opt
git clone https://github.com/Xean001/WebFront.git
cd WebFront
```

### 3. Crear archivo .env (si es necesario)
```bash
cat > .env << EOF
API_URL=https://api.fadely.me
NODE_ENV=production
EOF
```

### 4. Ejecutar despliegue
```bash
chmod +x deploy.sh
./deploy.sh full
```

### 5. Configurar firewall
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 🔐 SSL/TLS (HTTPS)

### Opción 1: Let's Encrypt con Certbot
```bash
# Instalar Certbot
sudo apt-get install certbot python3-certbot-nginx -y

# Obtener certificado
sudo certbot certonly --standalone -d tu-dominio.com

# Copiar certificados
sudo cp /etc/letsencrypt/live/tu-dominio.com/fullchain.pem certs/cert.pem
sudo cp /etc/letsencrypt/live/tu-dominio.com/privkey.pem certs/key.pem

# Permisos
sudo chmod 644 certs/*
```

### Opción 2: Nginx SSL Proxy
```bash
# Activar profile de producción
docker-compose --profile production up -d

# Configurar nginx-ssl.conf (ver plantilla abajo)
```

---

## 📦 Variables de Entorno

```bash
# .env (desarrollo)
NODE_ENV=development
API_URL=http://localhost:3000

# Producción (docker-compose)
NODE_ENV=production
API_URL=https://api.fadely.me
```

---

## 🚨 Troubleshooting

### El contenedor no inicia
```bash
# Ver logs detallados
docker logs fadely-webfront

# Verificar configuración de Nginx
docker run --rm -v ./nginx.conf:/etc/nginx/nginx.conf:ro \
    nginx:alpine nginx -t
```

### Puerto 80 en uso
```bash
# Cambiar puerto en docker-compose.yml
ports:
  - "8080:80"

# O liberar puerto
sudo lsof -i :80
sudo kill -9 <PID>
```

### Permiso denegado
```bash
# Agregar usuario a grupo docker
sudo usermod -aG docker $USER

# Reiniciar sesión o:
newgrp docker
```

### API no responde
```bash
# Verificar conexión de red
docker exec fadely-webfront curl -I https://api.fadely.me

# Revisar logs de Nginx
docker exec fadely-webfront tail -f /var/log/nginx/error.log
```

---

## 🔄 CI/CD Integration

### GitHub Actions
```yaml
name: Deploy to Docker Registry

on:
  push:
    branches: [ main, develop ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build and push Docker image
        run: |
          docker build -t fadely/webfront:${{ github.sha }} .
          docker tag fadely/webfront:${{ github.sha }} fadely/webfront:latest
          
          # Push to registry (requiere credenciales)
          echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
          docker push fadely/webfront:${{ github.sha }}
          docker push fadely/webfront:latest
```

---

## 📈 Escalado y Performance

### Limitar recursos del contenedor
```bash
docker run -d \
  --memory="512m" \
  --cpus="1" \
  --name fadely-webfront \
  fadely/webfront:latest
```

### Multiple contenedores con load balancing
```bash
# En docker-compose.yml
services:
  webfront-1:
    image: fadely/webfront:latest
    ports:
      - "8001:80"
  
  webfront-2:
    image: fadely/webfront:latest
    ports:
      - "8002:80"

  nginx-lb:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx-lb.conf:/etc/nginx/nginx.conf
```

---

## 🧹 Mantenimiento

### Limpiar imágenes viejas
```bash
docker image prune -f
```

### Limpiar contenedores detenidos
```bash
docker container prune -f
```

### Actualizar imagen
```bash
docker pull fadely/webfront:latest
docker-compose up -d --no-deps --build webfront
```

### Backup de datos
```bash
docker commit fadely-webfront fadely/webfront:backup-$(date +%Y%m%d)
```

---

## 📞 Soporte

Para problemas:

1. **Revisar logs:**
   ```bash
   docker logs fadely-webfront
   ```

2. **Ejecutar health check:**
   ```bash
   ./deploy.sh health
   ```

3. **Verificar recursos:**
   ```bash
   docker stats fadely-webfront
   ```

4. **Reportar issue:**
   - GitHub Issues: https://github.com/Xean001/WebFront/issues
   - Email: support@fadely.me

---

## ✅ Checklist de Despliegue

- [ ] Docker instalado y funcionando
- [ ] Repositorio clonado
- [ ] Archivo `deploy.sh` es ejecutable
- [ ] `nginx.conf` configurado
- [ ] Puertos disponibles (80, 443)
- [ ] Credenciales de API configuradas
- [ ] SSL/TLS configurado (producción)
- [ ] Firewall permitiendo puertos
- [ ] Logs monitoreados
- [ ] Health check pasando
- [ ] Aplicación accesible

---

## 📚 Referencias

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Angular Production Build](https://angular.io/guide/build)

