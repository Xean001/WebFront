import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const superAdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si el usuario está autenticado
  const isAuth = authService.isAuthenticated();
  console.log('superAdminGuard - Verificando acceso SUPER_ADMIN para:', state.url);
  console.log('superAdminGuard - isAuthenticated():', isAuth);

  if (!isAuth) {
    console.log('superAdminGuard - Usuario no autenticado, redirigiendo a login');
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Obtener usuario actual
  const user = authService.getCurrentUser();
  console.log('superAdminGuard - Usuario actual:', user);
  console.log('superAdminGuard - Tipo de usuario:', user?.tipoUsuario);

  // Verificar si es SUPER_ADMIN
  if (user?.tipoUsuario === 'SUPER_ADMIN') {
    console.log('superAdminGuard - ✅ Usuario es SUPER_ADMIN, permitiendo acceso');
    return true;
  }

  // Si no es SUPER_ADMIN, redirigir a página de acceso denegado
  console.log('superAdminGuard - ❌ Usuario no es SUPER_ADMIN. Tipo:', user?.tipoUsuario);
  router.navigate(['/auth/super-admin-requerido']);
  return false;
};
