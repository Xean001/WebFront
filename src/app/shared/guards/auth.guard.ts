import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuth = authService.isAuthenticated();
  console.log('authGuard - Verificando autenticación para:', state.url);
  console.log('authGuard - isAuthenticated():', isAuth);

  if (isAuth) {
    console.log('authGuard - Usuario autenticado, permitiendo acceso');
    return true;
  }

  // Redirigir a login y guardar la URL solicitada
  console.log('authGuard - Usuario no autenticado, redirigiendo a login');
  router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
