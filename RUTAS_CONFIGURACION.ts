// Configuración de rutas para ProyectoFinalWeb
// Este archivo contiene todas las rutas de los componentes generados

import { Routes } from '@angular/router';
import { ListaBarberiasComponent } from './features/barberias/lista/lista.component';
import { DetalleBarberiasComponent } from './features/barberias/detail/detail.component';
import { CreateComponent } from './features/appointments/create/create.component';
import { ListComponent } from './features/appointments/list/list.component';
import { AdministrarCitasComponent } from './features/appointments/administrar/administrar.component';
import { DetailComponent as BarberoDetailComponent } from './features/barbers/detail/detail.component';
import { GestionarServiciosComponent } from './features/servicios/gestionar/gestionar.component';
import { GestionarHorariosComponent } from './features/horarios/gestionar/gestionar.component';

export const routes: Routes = [
  {
    path: 'barberias',
    children: [
      {
        path: '',
        component: ListaBarberiasComponent,
        data: { title: 'Barberías' }
      },
      {
        path: 'detalle/:id',
        component: DetalleBarberiasComponent,
        data: { title: 'Detalle de Barbería' }
      }
    ]
  },
  {
    path: 'citas',
    children: [
      {
        path: 'crear',
        component: CreateComponent,
        data: { title: 'Crear Nueva Cita' }
      },
      {
        path: 'mis-citas',
        component: ListComponent,
        data: { title: 'Mis Citas' }
      },
      {
        path: 'administrar',
        component: AdministrarCitasComponent,
        data: { title: 'Gestión de Citas' }
      }
    ]
  },
  {
    path: 'barberos',
    children: [
      {
        path: ':id',
        component: BarberoDetailComponent,
        data: { title: 'Perfil de Barbero' }
      }
    ]
  },
  {
    path: 'servicios',
    children: [
      {
        path: 'gestionar',
        component: GestionarServiciosComponent,
        data: { title: 'Gestión de Servicios' }
      }
    ]
  },
  {
    path: 'horarios',
    children: [
      {
        path: 'gestionar',
        component: GestionarHorariosComponent,
        data: { title: 'Gestión de Horarios' }
      }
    ]
  }
];

/**
 * RUTAS DISPONIBLES:
 * 
 * CLIENTE:
 * - GET /barberias                    → Listado de barberías
 * - GET /barberias/detalle/:id        → Detalle de barbería
 * - GET /barberos/:id                 → Perfil de barbero
 * - GET /citas/crear                  → Crear nueva cita
 * - GET /citas/mis-citas              → Ver mis citas
 * 
 * BARBERO/ADMIN:
 * - GET /citas/administrar            → Gestión de citas
 * - GET /servicios/gestionar          → Gestión de servicios
 * - GET /horarios/gestionar           → Gestión de horarios
 * 
 * COMPONENTES PENDIENTES:
 * - Autenticación (login, registro)
 * - Editar perfil
 * - Mis favoritos
 * - Valoraciones
 * - Dashboard admin
 */
