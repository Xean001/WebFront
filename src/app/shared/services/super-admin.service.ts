import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UsuarioResponse {
  idUsuario: number;
  nombre: string;
  correo: string;
  tipoUsuario: string;
  estadoSuscripcion?: string;
  telefonoUsuario?: string;
  fechaCreacion?: string;
}

export interface BarberiasResponse {
  idBarberia: number;
  nombre: string;
  direccion: string;
  telefono: string;
  usuarioOwner: UsuarioResponse;
  estadoSuscripcion?: string;
  fechaCreacion?: string;
  servicios?: any[];
}

export interface PagoResponse {
  idPago: number;
  idUsuario: number;
  monto: number;
  metodoPago: string;
  estado: string;
  tipoPlan: string;
  comprobante?: string;
  fechaCreacion?: string;
}

export interface EstadisticasResponse {
  totalUsuarios: number;
  totalAdmins: number;
  totalBarberias: number;
  totalPagos: number;
  montoPagos: number;
  estadoSuscripciones: {
    activas: number;
    pendientes: number;
    pausadas: number;
    canceladas: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SuperAdminService {
  private apiUrl = 'https://api.fadely.me/api';

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los usuarios del sistema
   */
  obtenerTodosLosUsuarios(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/super-admin/usuarios`);
  }

  /**
   * Obtener todos los usuarios (alternativa)
   */
  obtenerUsuarios(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/usuarios`);
  }

  /**
   * Obtener detalles de un usuario específico
   */
  obtenerUsuario(idUsuario: number): Observable<UsuarioResponse> {
    return this.http.get<UsuarioResponse>(`${this.apiUrl}/super-admin/usuarios/${idUsuario}`);
  }

  /**
   * Obtener todas las barberías del sistema
   */
  obtenerTodasLasBarberias(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/super-admin/barberias`);
  }

  /**
   * Obtener detalles de una barbería específica
   */
  obtenerBarberia(idBarberia: number): Observable<BarberiasResponse> {
    return this.http.get<BarberiasResponse>(`${this.apiUrl}/super-admin/barberias/${idBarberia}`);
  }

  /**
   * Obtener todos los pagos del sistema
   */
  obtenerTodosLosPagos(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/super-admin/pagos`);
  }

  /**
   * Obtener detalles de un pago específico
   */
  obtenerPago(idPago: number): Observable<PagoResponse> {
    return this.http.get<PagoResponse>(`${this.apiUrl}/super-admin/pagos/${idPago}`);
  }

  /**
   * Obtener estadísticas del sistema
   */
  obtenerEstadisticas(): Observable<EstadisticasResponse> {
    return this.http.get<EstadisticasResponse>(`${this.apiUrl}/super-admin/estadisticas`);
  }

  /**
   * Obtener dashboard completo con todos los datos
   * GET /api/super-admin/dashboard
   * Requiere: JWT con rol SUPER_ADMIN
   */
  obtenerDashboard(): Observable<any> {
    console.log('📊 Obteniendo datos del dashboard...');
    console.log('📤 URL:', `${this.apiUrl}/super-admin/dashboard`);
    
    return this.http.get<any>(`${this.apiUrl}/super-admin/dashboard`);
  }

  /**
   * Obtener usuarios filtrados por estado de suscripción
   */
  obtenerUsuariosPorEstadoSuscripcion(estado: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/super-admin/usuarios/suscripcion/${estado}`);
  }

  /**
   * Obtener barberías filtradas por estado
   */
  obtenerBarberiasActivas(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/super-admin/barberias/estado/activa`);
  }

  /**
   * Obtener pagos pendientes
   */
  obtenerPagosPendientes(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/super-admin/pagos/estado/pendiente`);
  }

  /**
   * Actualizar estado de suscripción de un usuario
   */
  actualizarEstadoSuscripcion(idUsuario: number, nuevoEstado: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/super-admin/usuarios/${idUsuario}/suscripcion`, {
      estadoSuscripcion: nuevoEstado
    });
  }

  /**
   * Aprobar un pago manualmente
   */
  aprobarPago(idPago: number, tipoPlan?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/super-admin/pagos/${idPago}/aprobar`, {
      tipoPlan: tipoPlan || 'MENSUAL'
    });
  }

  /**
   * Rechazar un pago
   */
  rechazarPago(idPago: number, razon?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/super-admin/pagos/${idPago}/rechazar`, {
      razon: razon || 'Rechazado por administrador'
    });
  }

  /**
   * Suspender una barbería
   */
  suspenderBarberia(idBarberia: number, razon?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/super-admin/barberias/${idBarberia}/suspender`, {
      razon: razon || 'Suspendido por administrador'
    });
  }

  /**
   * Reactivar una barbería
   */
  reactivarBarberia(idBarberia: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/super-admin/barberias/${idBarberia}/reactivar`, {});
  }

  /**
   * Obtener reportes de actividad
   */
  obtenerReporteActividad(desde?: Date, hasta?: Date): Observable<any> {
    let params = '';
    if (desde) params += `?desde=${desde.toISOString()}`;
    if (hasta) params += (params ? '&' : '?') + `hasta=${hasta.toISOString()}`;
    
    return this.http.get<any>(`${this.apiUrl}/super-admin/reportes/actividad${params}`);
  }

  /**
   * Obtener reportes de pagos
   */
  obtenerReportePagos(desde?: Date, hasta?: Date): Observable<any> {
    let params = '';
    if (desde) params += `?desde=${desde.toISOString()}`;
    if (hasta) params += (params ? '&' : '?') + `hasta=${hasta.toISOString()}`;
    
    return this.http.get<any>(`${this.apiUrl}/super-admin/reportes/pagos${params}`);
  }

  /**
   * Enviar notificación a admin
   */
  enviarNotificacion(idUsuario: number, asunto: string, mensaje: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/super-admin/notificaciones`, {
      idUsuario,
      asunto,
      mensaje
    });
  }

  /**
   * Cambiar plan de un usuario
   */
  cambiarPlanUsuario(idUsuario: number, nuevoPlan: string, dias?: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/super-admin/usuarios/${idUsuario}/plan`, {
      plan: nuevoPlan,
      dias: dias || this.obtenerDiasDelPlan(nuevoPlan)
    });
  }

  /**
   * Obtener días del plan
   */
  private obtenerDiasDelPlan(plan: string): number {
    const planes: { [key: string]: number } = {
      'PRUEBA': 7,
      'MENSUAL': 30,
      'SEMESTRAL': 180,
      'ANUAL': 365
    };
    return planes[plan] || 30;
  }

  /**
   * Exportar datos de usuarios (CSV/Excel)
   */
  exportarUsuarios(formato: 'csv' | 'excel' = 'csv'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/super-admin/exportar/usuarios?formato=${formato}`, {
      responseType: 'blob'
    });
  }

  /**
   * Exportar datos de barberías (CSV/Excel)
   */
  exportarBarberias(formato: 'csv' | 'excel' = 'csv'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/super-admin/exportar/barberias?formato=${formato}`, {
      responseType: 'blob'
    });
  }

  /**
   * Exportar datos de pagos (CSV/Excel)
   */
  exportarPagos(formato: 'csv' | 'excel' = 'csv'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/super-admin/exportar/pagos?formato=${formato}`, {
      responseType: 'blob'
    });
  }
}
