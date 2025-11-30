#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REGISTRY="docker.io"
IMAGE_NAME="fadely/webfront"
IMAGE_TAG="latest"
CONTAINER_NAME="fadely-webfront"

# Functions
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if Docker is installed
check_docker() {
    print_header "Verificando Docker..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker no está instalado"
        exit 1
    fi
    print_success "Docker instalado"
    
    if ! command -v docker-compose &> /dev/null; then
        print_warning "Docker Compose no está instalado (pero es opcional)"
    else
        print_success "Docker Compose instalado"
    fi
}

# Build Docker image
build_image() {
    print_header "Construyendo imagen Docker..."
    
    docker build -t ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} \
                 -t ${REGISTRY}/${IMAGE_NAME}:$(date +%Y%m%d) \
                 -f Dockerfile \
                 .
    
    if [ $? -eq 0 ]; then
        print_success "Imagen construida exitosamente"
        docker images | grep fadely/webfront
    else
        print_error "Error al construir imagen"
        exit 1
    fi
}

# Run container
run_container() {
    print_header "Iniciando contenedor..."
    
    # Verificar si el contenedor ya existe
    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        print_warning "Contenedor ya existe, deteniendo versión anterior..."
        docker stop ${CONTAINER_NAME}
        docker rm ${CONTAINER_NAME}
    fi
    
    docker run -d \
               --name ${CONTAINER_NAME} \
               -p 80:80 \
               -v ./nginx.conf:/etc/nginx/nginx.conf:ro \
               --restart unless-stopped \
               --health-cmd='wget --quiet --tries=1 --spider http://localhost/health || exit 1' \
               --health-interval=30s \
               --health-timeout=3s \
               --health-retries=3 \
               --health-start-period=5s \
               ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
    
    if [ $? -eq 0 ]; then
        print_success "Contenedor iniciado: ${CONTAINER_NAME}"
        sleep 2
        docker ps --filter "name=${CONTAINER_NAME}"
    else
        print_error "Error al iniciar contenedor"
        exit 1
    fi
}

# Push to registry
push_image() {
    print_header "Enviando imagen al registro..."
    
    docker push ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
    
    if [ $? -eq 0 ]; then
        print_success "Imagen enviada a ${REGISTRY}"
    else
        print_error "Error al enviar imagen"
        exit 1
    fi
}

# View logs
view_logs() {
    print_header "Mostrando logs del contenedor..."
    docker logs -f ${CONTAINER_NAME}
}

# Check health
check_health() {
    print_header "Verificando estado de la aplicación..."
    
    sleep 3
    
    if docker ps --filter "name=${CONTAINER_NAME}" | grep -q ${CONTAINER_NAME}; then
        print_success "Contenedor está corriendo"
        
        # Check health
        HEALTH=$(docker inspect ${CONTAINER_NAME} --format='{{.State.Health.Status}}' 2>/dev/null)
        if [ "$HEALTH" = "healthy" ]; then
            print_success "Aplicación está saludable"
        else
            print_warning "Estado de salud: $HEALTH"
        fi
        
        # Test endpoint
        echo ""
        print_header "Probando conexión..."
        curl -I http://localhost/ 2>/dev/null | head -5
    else
        print_error "Contenedor no está corriendo"
    fi
}

# Stop container
stop_container() {
    print_header "Deteniendo contenedor..."
    
    if docker ps --filter "name=${CONTAINER_NAME}" | grep -q ${CONTAINER_NAME}; then
        docker stop ${CONTAINER_NAME}
        print_success "Contenedor detenido"
    else
        print_warning "Contenedor no está corriendo"
    fi
}

# Remove container
remove_container() {
    print_header "Removiendo contenedor..."
    
    if docker ps -a --filter "name=${CONTAINER_NAME}" | grep -q ${CONTAINER_NAME}; then
        docker rm ${CONTAINER_NAME}
        print_success "Contenedor removido"
    else
        print_warning "Contenedor no existe"
    fi
}

# Clean images
clean_images() {
    print_header "Limpiando imágenes..."
    
    docker image prune -f
    print_success "Imágenes huérfanas removidas"
}

# Display usage
usage() {
    echo ""
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos disponibles:"
    echo "  build      - Construir imagen Docker"
    echo "  run        - Ejecutar contenedor"
    echo "  push       - Enviar imagen al registro"
    echo "  logs       - Ver logs del contenedor"
    echo "  health     - Verificar salud de la aplicación"
    echo "  stop       - Detener contenedor"
    echo "  remove     - Remover contenedor"
    echo "  clean      - Limpiar imágenes"
    echo "  full       - Ejecutar build, run y health (flujo completo)"
    echo "  compose    - Usar docker-compose"
    echo ""
    echo "Ejemplos:"
    echo "  $0 build"
    echo "  $0 full"
    echo "  $0 compose up"
    echo ""
}

# Main
case "${1:-}" in
    build)
        check_docker
        build_image
        ;;
    run)
        run_container
        ;;
    push)
        push_image
        ;;
    logs)
        view_logs
        ;;
    health)
        check_health
        ;;
    stop)
        stop_container
        ;;
    remove)
        remove_container
        ;;
    clean)
        clean_images
        ;;
    full)
        check_docker
        build_image
        run_container
        check_health
        ;;
    compose)
        shift
        docker-compose "$@"
        ;;
    *)
        usage
        exit 1
        ;;
esac

echo ""
