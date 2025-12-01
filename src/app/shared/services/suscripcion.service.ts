import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SuscripcionDTO {
  idSuscripcion: number;
  idUsuario: number;
  nombreUsuario: string;
  idPlan: number;
  nombrePlan: string;
  tipoPlan: 'PRUEBA' | 'MENSUAL' | 'SEMESTRAL' | 'ANUAL';
  precio: number;
  fechaInicio: string; // formato: "2025-12-01"
  fechaFin: string;
  estado: 'ACTIVA' | 'PENDIENTE_PAGO' | 'PAUSADA' | 'CANCELADA';
  autoRenovar: boolean;
  diasRestantes: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class SuscripcionService {
  private apiUrl = 'https://api.fadely.me/api/suscripciones';

  constructor(private http: HttpClient) {}

  /**
   * Obtener la suscripción activa del usuario autenticado
   * GET /api/suscripciones/mi-suscripcion
   * Requiere autenticación
   */
  obtenerMiSuscripcion(): Observable<ApiResponse<SuscripcionDTO>> {
    return this.http.get<ApiResponse<SuscripcionDTO>>(`${this.apiUrl}/mi-suscripcion`);
  }

  /**
   * Obtener el ID de suscripción del usuario autenticado
   * GET /api/suscripciones/mi-suscripcion-id
   * Requiere autenticación
   * Nota: Este es un endpoint simplificado que solo devuelve el ID
   */
  obtenerIdSuscripcion(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.apiUrl}/mi-suscripcion-id`);
  }

  /**
   * Obtener historial de suscripciones del usuario
   * GET /api/suscripciones/mis-suscripciones
   */
  obtenerMisSuscripciones(): Observable<ApiResponse<SuscripcionDTO[]>> {
    return this.http.get<ApiResponse<SuscripcionDTO[]>>(`${this.apiUrl}/mis-suscripciones`);
  }

  /**
   * Crear una nueva suscripción para el usuario autenticado
   * POST /api/suscripciones/crear
   * @param tipoPlan - Tipo de plan: PRUEBA, MENSUAL, SEMESTRAL, ANUAL
   */
  crearSuscripcion(tipoPlan: 'PRUEBA' | 'MENSUAL' | 'SEMESTRAL' | 'ANUAL'): Observable<ApiResponse<SuscripcionDTO>> {
    return this.http.post<ApiResponse<SuscripcionDTO>>(`${this.apiUrl}/crear?tipoPlan=${tipoPlan}`, {});
  }
}
