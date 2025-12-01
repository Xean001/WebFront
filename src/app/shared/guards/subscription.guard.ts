import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, catchError, of } from 'rxjs';

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
  console.log('subscriptionGuard - Usuario actual (localStorage):', user);

  // Si ya tiene suscripción activa en localStorage, permitir acceso inmediato
  if (user?.estadoSuscripcion === 'ACTIVA') {
    console.log('subscriptionGuard - Suscripción activa en localStorage, permitiendo acceso');
    return true;
  }

  // Si no tiene suscripción activa, verificar con el backend por si fue aprobada recientemente
  console.log('subscriptionGuard - Verificando estado con el backend...');
  return authService.verificarEstadoSuscripcion().pipe(
    map(response => {
      if (response.success && response.data?.estadoSuscripcion === 'ACTIVA') {
        console.log('subscriptionGuard - ✅ Suscripción aprobada en backend, permitiendo acceso');
        return true;
      }
      
      console.log('subscriptionGuard - ❌ Suscripción no activa. Estado:', response.data?.estadoSuscripcion);
      router.navigate(['/auth/suscripcion-requerida']);
      return false;
    }),
    catchError(error => {
      console.error('subscriptionGuard - Error verificando estado:', error);
      console.log('subscriptionGuard - Usando estado local:', user?.estadoSuscripcion);
      router.navigate(['/auth/suscripcion-requerida']);
      return of(false);
    })
  );
};

