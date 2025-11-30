import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Endpoints que NO requieren autenticación (públicos)
  // Solo incluir endpoints que definitivamente son públicos
  const endpointsPublicos = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/barberias/activas',           // Público - sin paginación
    '/api/barberias/disponibles',       // Público
    '/api/barberias/ciudades',          // Público - lista de ciudades
    '/api/barberias/',                  // Detalle público (por ID)
  ];

  // Verificar si es un endpoint público
  const esPublico = endpointsPublicos.some(endpoint => req.url.includes(endpoint));

  // Si tiene token y no es un endpoint público, agregar el token
  if (token && !esPublico) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedRequest);
  }

  return next(req);
};
