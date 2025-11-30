import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Interfaz que representa un plan de suscripción
 */
export interface PlanSuscripcion {
  idPlan?: number;
  nombre: string;
  tipoPlan: 'PRUEBA' | 'MENSUAL' | 'SEMESTRAL' | 'ANUAL';
  descripcion: string;
  precio: number;
  duracionDias: number;
  limiteBarberos: number;
  limiteServicios: number | null;
  estado?: 'ACTIVO' | 'INACTIVO';
}

/**
 * Interfaz para la suscripción del usuario
 */
export interface Suscripcion {
  idSuscripcion?: number;
  idUsuario: number;
  idPlan: number;
  estado: 'PENDIENTE_PAGO' | 'ACTIVA' | 'PAUSADA' | 'CANCELADA';
  fechaInicio?: string;
  fechaFin?: string;
  fechaCreacion?: string;
  metodoPagoUtilizado?: string;
}

/**
 * Respuesta estándar de la API
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class PlanSuscripcionService {
  private apiUrl = 'https://api.fadely.me/api/suscripciones';

  constructor(private http: HttpClient) { }

  /**
   * Obtener todos los planes disponibles
   * GET /suscripciones/planes
   */
  obtenerPlanes(): Observable<ApiResponse<PlanSuscripcion[]>> {
    return this.http.get<ApiResponse<PlanSuscripcion[]>>(`${this.apiUrl}/planes`);
  }

  /**
   * Obtener un plan específico por ID
   * GET /suscripciones/planes/{id}
   */
  obtenerPlanPorId(idPlan: number): Observable<ApiResponse<PlanSuscripcion>> {
    return this.http.get<ApiResponse<PlanSuscripcion>>(`${this.apiUrl}/planes/${idPlan}`);
  }

  /**
   * Obtener la suscripción actual del usuario
   * GET /suscripciones/mi-suscripcion
   * Requiere: Autenticación (token JWT)
   */
  obtenerMiSuscripcion(): Observable<ApiResponse<Suscripcion>> {
    return this.http.get<ApiResponse<Suscripcion>>(`${this.apiUrl}/mi-suscripcion`);
  }

  /**
   * Obtener suscripción por usuario ID
   * GET /suscripciones/usuario/{idUsuario}
   * Requiere: Autenticación
   */
  obtenerSuscripcionPorUsuario(idUsuario: number): Observable<ApiResponse<Suscripcion>> {
    return this.http.get<ApiResponse<Suscripcion>>(`${this.apiUrl}/usuario/${idUsuario}`);
  }

  /**
   * Crear una nueva suscripción (usado en registro)
   * POST /suscripciones
   * Requiere: Autenticación (solo ADMIN)
   */
  crearSuscripcion(suscripcion: Suscripcion): Observable<ApiResponse<Suscripcion>> {
    return this.http.post<ApiResponse<Suscripcion>>(`${this.apiUrl}`, suscripcion);
  }

  /**
   * Actualizar estado de suscripción
   * PUT /suscripciones/{id}/estado
   * Requiere: Autenticación
   */
  actualizarEstadoSuscripcion(idSuscripcion: number, nuevoEstado: 'ACTIVA' | 'PAUSADA' | 'CANCELADA'): Observable<ApiResponse<Suscripcion>> {
    const params = new HttpParams().set('estado', nuevoEstado);
    return this.http.put<ApiResponse<Suscripcion>>(`${this.apiUrl}/${idSuscripcion}/estado`, {}, { params });
  }

  /**
   * Cancelar una suscripción
   * PUT /suscripciones/{id}/cancelar
   * Requiere: Autenticación
   */
  cancelarSuscripcion(idSuscripcion: number): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/${idSuscripcion}/cancelar`, {});
  }
}
