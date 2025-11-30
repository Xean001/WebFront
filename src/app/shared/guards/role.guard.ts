import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard que verifica si el usuario tiene un rol específico
 * Uso: canActivate: [roleGuard({ role: 'ADMIN' })]
 */
export const roleGuard = (options: { role: string }): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const user = authService.getCurrentUser();
    console.log('roleGuard - Verificando rol para:', state.url);
    console.log('roleGuard - User role:', user?.tipoUsuario);

    if (user && user.tipoUsuario === options.role) {
      console.log(`roleGuard - Usuario tiene rol ${options.role}, permitiendo acceso`);
      return true;
    }

    console.log(`roleGuard - Usuario no tiene rol ${options.role}, denegando acceso`);
    router.navigate(['/dashboard']);
    return false;
  };
};
