import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { SuperAdminService } from '../../../shared/services/super-admin.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface DashboardData {
  totalUsuarios: number;
  totalAdmins: number;
  totalBarberos: number;
  totalClientes: number;
  nuevosUsuariosHoy: number;
  nuevosUsuariosMes: number;
  totalBarberias: number;
  barberiasActivas: number;
  barberiasInactivas: number;
  nuevasBarberiasHoy: number;
  nuevasBarberiasMes: number;
  suscripcionesActivas: number;
  suscripcionesPorVencer: number;
  suscripcionesVencidas: number;
  suscripcionesPorPlan: {
    prueba: number;
    mensual: number;
    semestral: number;
    anual: number;
  };
  pagosPendientes: number;
  pagosAprobadosHoy: number;
  pagosAprobadosMes: number;
  pagosRechazadosMes: number;
  ingresosTotalesMes: number;
  citasHoy: number;
  citasMes: number;
  citasPendientes: number;
  citasCompletadas: number;
  citasCanceladas: number;
  topBarberias: Array<{
    idBarberia: number;
    nombre: string;
    ciudad: string;
    totalCitas: number;
    estadoSuscripcion: string;
    fechaVencimiento: string;
  }>;
  actividadesRecientes: Array<{
    tipo: string;
    descripcion: string;
    fecha: string;
    nombreUsuario: string;
    emailUsuario: string;
  }>;
}

@Component({
  selector: 'app-super-admin-dashboard',
  templateUrl: './super-admin-dashboard.component.html',
  styleUrls: ['./super-admin-dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class SuperAdminDashboardComponent implements OnInit, OnDestroy {
  cargando: boolean = true;
  errores: { [key: string]: string } = {};
  currentUser: any = null;
  dashboardData: DashboardData | null = null;
  
  private destroy$ = new Subject<void>();

  // Propiedades computed para evitar errores de null
  get topBarberias() {
    return this.dashboardData?.topBarberias || [];
  }

  get actividadesRecientes() {
    return this.dashboardData?.actividadesRecientes || [];
  }

  constructor(
    private authService: AuthService,
    private superAdminService: SuperAdminService
  ) {
    console.log('👑 SuperAdminDashboardComponent inicializado');
  }

  ngOnInit(): void {
    console.log('👑 SuperAdminDashboardComponent - ngOnInit');
    
    // Obtener usuario actual
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.currentUser = user;
          console.log('👑 Usuario actual:', user?.nombre, user?.tipoUsuario);
          
          // Validar que sea SUPER_ADMIN
          if (user?.tipoUsuario !== 'SUPER_ADMIN') {
            this.errores['general'] = '❌ ACCESO DENEGADO: Solo SUPER_ADMIN puede acceder al dashboard';
            this.cargando = false;
            console.warn('⚠️ Usuario no es SUPER_ADMIN:', user?.tipoUsuario);
            return;
          }

          // Cargar datos del dashboard
          this.cargarDashboard();
        },
        error: (error) => {
          console.error('❌ Error obteniendo usuario:', error);
          this.errores['general'] = 'Error al obtener datos del usuario';
          this.cargando = false;
        }
      });
  }

  cargarDashboard(): void {
    console.log('📊 Cargando datos del dashboard...');
    
    this.superAdminService.obtenerDashboard()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log('✅ Dashboard cargado:', response);
          this.dashboardData = response.data;
          this.cargando = false;
        },
        error: (error: any) => {
          console.error('❌ Error cargando dashboard:', error);
          this.errores['general'] = 'Error al cargar el dashboard del sistema';
          this.cargando = false;
        }
      });
  }

  ngOnDestroy(): void {
    console.log('👑 SuperAdminDashboardComponent - ngOnDestroy');
    this.destroy$.next();
    this.destroy$.complete();
  }
}

