# Solución al Problema de Cache de Imágenes

## Problema
Las imágenes actualizadas no se muestran en el navegador debido al cache, incluso después de limpiarlo.

## Solución Implementada
Cambiar el nombre del archivo cada vez que se actualiza, agregando un timestamp único. Esto fuerza al navegador a cargar la nueva imagen porque la URL es diferente.

### Backend
1. Modificar `FileStorageService.java` para:
   - Eliminar la imagen anterior antes de guardar la nueva
   - Generar nombre de archivo con timestamp: `{id}_{timestamp}.{ext}`
   - Retornar la nueva URL con el timestamp incluido

### Frontend
- No requiere cambios. El nuevo nombre de archivo se refleja automáticamente en la URL.

## Resultado
Cada actualización de imagen genera una URL única, evitando problemas de cache.
