import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, catchError, of } from 'rxjs';

export const subscriptionGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si el usuario está autenticado
  const isAuth = authService.isAuthenticated();

  if (!isAuth) {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Obtener usuario actual
  const user = authService.getCurrentUser();

  // Si es un empleado con barbería asignada, permitir acceso inmediato
  if (user?.tipoUsuario === 'BARBERO') {
    return true;
  }

  // Si ya tiene suscripción activa en localStorage, permitir acceso inmediato
  if (user?.estadoSuscripcion === 'ACTIVA') {
    return true;
  }

  // Si no tiene suscripción activa, verificar con el backend por si fue aprobada recientemente
  return authService.verificarEstadoSuscripcion().pipe(
    map(response => {
      if (response.success && response.data?.estadoSuscripcion === 'ACTIVA') {
        return true;
      }

      router.navigate(['/auth/suscripcion-requerida']);
      return false;
    }),
    catchError(error => {
      router.navigate(['/auth/suscripcion-requerida']);
      return of(false);
    })
  );
};

