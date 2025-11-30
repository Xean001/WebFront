import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const subscriptionGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si el usuario está autenticado
  const isAuth = authService.isAuthenticated();
  console.log('subscriptionGuard - Verificando suscripción para:', state.url);
  console.log('subscriptionGuard - isAuthenticated():', isAuth);

  if (!isAuth) {
    console.log('subscriptionGuard - Usuario no autenticado, redirigiendo a login');
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Obtener usuario actual
  const user = authService.getCurrentUser();
  console.log('subscriptionGuard - Usuario actual:', user);

  // Verificar si tiene suscripción activa
  if (user?.estadoSuscripcion === 'ACTIVA') {
    console.log('subscriptionGuard - Suscripción activa, permitiendo acceso');
    return true;
  }

  // Si no tiene suscripción activa, redirigir a la página de suscripción requerida
  console.log('subscriptionGuard - Suscripción no activa. Estado:', user?.estadoSuscripcion);
  router.navigate(['/auth/suscripcion-requerida']);
  return false;
};

