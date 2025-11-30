import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  // Ruta por defecto - redirige a dashboard (página principal pública)
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  
  // Dashboard - Página principal pública (sin guard)
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/home/home.component').then(m => m.HomeComponent)
  },
  
  // Rutas de autenticación (públicas - para futuros logins de admin/barberos)
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'auth/forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  
  // Rutas de citas (públicas - clientes pueden ver y hacer reservas)
  {
    path: 'appointments',
    children: [
      {
        path: 'list',
        loadComponent: () => import('./features/appointments/list/list.component').then(m => m.ListComponent)
      },
      {
        path: 'create',
        loadComponent: () => import('./features/appointments/create/create.component').then(m => m.CreateComponent)
      },
      {
        path: 'detail/:id',
        loadComponent: () => import('./features/appointments/detail/detail.component').then(m => m.DetailComponent)
      }
    ]
  },
  
  // Rutas de barberías (públicas - clientes ven barberías + admin)
  {
    path: 'barberias',
    children: [
      {
        path: 'list',
        loadComponent: () => import('./features/barberias/lista/lista.component').then(m => m.ListaBarberiasComponent)
      },
      {
        path: 'detail/:id',
        loadComponent: () => import('./features/barberias/detail/detail.component').then(m => m.DetalleBarberiasComponent)
      },
      {
        path: 'administrar',
        loadComponent: () => import('./features/barberias/administrar/administrar.component').then(m => m.AdministrarBarberiasComponent),
        canActivate: [authGuard]  // Solo para usuarios autenticados como ADMIN
      }
    ]
  },

  // Rutas de barberos (públicas - clientes ven perfiles)
  {
    path: 'barbers',
    children: [
      {
        path: 'list',
        loadComponent: () => import('./features/barbers/list/list.component').then(m => m.ListBarbersComponent)
      },
      {
        path: 'detail/:id',
        loadComponent: () => import('./features/barbers/detail/detail.component').then(m => m.DetailComponent)
      },
      {
        path: 'manage',
        loadComponent: () => import('./features/barbers/manage/manage.component').then(m => m.ManageComponent),
        canActivate: [authGuard]  // Solo para barberos autenticados
      }
    ]
  },
  
  // Rutas de usuarios (públicas para ver perfil, protegidas para editar)
  {
    path: 'users',
    children: [
      {
        path: 'profile',
        loadComponent: () => import('./features/users/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'edit-profile',
        loadComponent: () => import('./features/users/edit-profile/edit-profile.component').then(m => m.EditProfileComponent),
        canActivate: [authGuard]  // Solo para usuarios autenticados
      }
    ]
  },
  
  // Rutas de horarios (admin)
  {
    path: 'horarios',
    children: [
      {
        path: 'administrar',
        loadComponent: () => import('./features/horarios/administrar/administrar.component').then(m => m.AdministrarHorariosComponent),
        canActivate: [authGuard]  // Solo para usuarios autenticados como ADMIN
      }
    ]
  },

  // Rutas de servicios (admin)
  {
    path: 'servicios',
    children: [
      {
        path: 'administrar',
        loadComponent: () => import('./features/servicios/administrar/administrar.component').then(m => m.AdministrarServiciosComponent),
        canActivate: [authGuard]  // Solo para usuarios autenticados como ADMIN
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
