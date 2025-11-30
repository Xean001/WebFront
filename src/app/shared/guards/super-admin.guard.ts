import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

export const superAdminGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si el usuario está autenticado
  const isAuth = authService.isAuthenticated();
  console.log('👑 superAdminGuard - Verificando acceso SUPER_ADMIN para:', state.url);
  console.log('👑 superAdminGuard - isAuthenticated():', isAuth);

  if (!isAuth) {
    console.log('👑 superAdminGuard - ❌ Usuario no autenticado, redirigiendo a login');
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Obtener usuario actual del observable para asegurar que está actualizado
  const user = await firstValueFrom(authService.currentUser$);
  console.log('👑 superAdminGuard - Usuario actual desde observable:', user);
  console.log('👑 superAdminGuard - Tipo de usuario:', user?.tipoUsuario);
  console.log('👑 superAdminGuard - Campos del usuario:', {
    nombre: user?.nombre,
    correo: user?.correo,
    tipoUsuario: user?.tipoUsuario,
    idUsuario: user?.idUsuario,
    token: user?.token ? 'Presente' : 'No presente'
  });

  // Verificar si es SUPER_ADMIN
  if (user?.tipoUsuario === 'SUPER_ADMIN') {
    console.log('👑 superAdminGuard - ✅ Usuario ES SUPER_ADMIN, permitiendo acceso');
    return true;
  }

  // Si no es SUPER_ADMIN, redirigir a página de acceso denegado
  console.log('👑 superAdminGuard - ❌ Usuario NO es SUPER_ADMIN. Tipo:', user?.tipoUsuario);
  router.navigate(['/auth/super-admin-requerido']);
  return false;
};
