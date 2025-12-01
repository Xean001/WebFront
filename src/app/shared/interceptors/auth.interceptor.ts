import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  console.log('🔐 AuthInterceptor - URL:', req.url);
  console.log('🔑 Token disponible:', token ? 'SÍ' : 'NO');

  // Endpoints que NO requieren autenticación (públicos)
  const endpointsPublicos = [
    '/api/auth/login',
    '/api/auth/registro',
    '/api/auth/admin/registro',
    '/api/barberias/activas',           // Público - sin paginación
    '/api/barberias/disponibles',       // Público
    '/api/barberias/ciudades',          // Público - lista de ciudades
  ];

  // Verificar si es un endpoint público
  const esPublico = endpointsPublicos.some(endpoint => req.url.includes(endpoint));
  console.log('🌍 Es público?', esPublico);

  // SIEMPRE agregar token si existe y no es público
  // Para /api/pagos/* endpoints, el token es requerido (incluso datos-pago)
  if (token && !esPublico) {
    console.log('✅ Agregando token Authorization a la petición');
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedRequest);
  }

  if (!token && !esPublico) {
    console.warn('⚠️ Endpoint protegido sin token - Puede resultar en 401/403');
  }

  console.log('⚠️ NO se agregó token (público o sin token)');
  return next(req);
};
