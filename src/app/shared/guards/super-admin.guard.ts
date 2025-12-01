import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

export const superAdminGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si el usuario está autenticado
  const isAuth = authService.isAuthenticated();

  if (!isAuth) {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Obtener usuario actual del observable para asegurar que está actualizado
  const user = await firstValueFrom(authService.currentUser$);

  // Verificar si es SUPER_ADMIN
  if (user?.tipoUsuario === 'SUPER_ADMIN') {
    return true;
  }

  // Si no es SUPER_ADMIN, redirigir a página de acceso denegado
  router.navigate(['/auth/super-admin-requerido']);
  return false;
};
