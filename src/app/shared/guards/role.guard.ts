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

    if (user && user.tipoUsuario === options.role) {
      return true;
    }

    router.navigate(['/dashboard']);
    return false;
  };
};
