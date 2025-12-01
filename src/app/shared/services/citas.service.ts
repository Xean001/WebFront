import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Cita {
  idCita: number;
  idCliente: number;
  idBarbero: number;
  idServicio: number;
  idBarberia: number;
  fechaCita: string;
  horaCita: string;
  estado: string;
  codigoReserva: string;
  precio: number;
  observaciones: string;
  fechaCreacion: string;
}

export interface CrearCitaRequest {
  idBarbero: number;
  idServicio: number;
  idBarberia: number;
  fecha: string;  // Backend espera "fecha" en formato YYYY-MM-DD
  horaInicio: string;  // Backend espera "horaInicio" en formato HH:mm
  observaciones?: string;
  codigoPromocion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CitasService {
  private apiUrl = 'https://api.fadely.me/api/citas';

  constructor(private http: HttpClient) { }

  crearCita(request: CrearCitaRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}`, request);
  }

  obtenerMisCitas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/mis-citas`);
  }

  obtenerCitasPorBarbero(idBarbero: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/barbero/${idBarbero}`);
  }

  obtenerCitasPorBarberia(idBarberia: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/barberia/${idBarberia}`);
  }

  obtenerCitasPendientes(idBarberia: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/barberia/${idBarberia}/pendientes`);
  }

  obtenerPorCodigo(codigoReserva: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/codigo/${codigoReserva}`);
  }

  confirmarCita(idCita: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${idCita}/confirmar`, {});
  }

  cancelarCita(idCita: number, motivo?: string): Observable<any> {
    const params = motivo ? new HttpParams().set('motivo', motivo) : undefined;
    return this.http.put(`${this.apiUrl}/${idCita}/cancelar`, {}, { params });
  }

  marcarComoCompletada(idCita: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${idCita}/completar`, {});
  }

  // Métodos para barberos
  obtenerMisCitasBarbero(): Observable<any> {
    return this.http.get(`${this.apiUrl}/mis-citas-barbero`);
  }

  obtenerMisCitasHoy(): Observable<any> {
    return this.http.get(`${this.apiUrl}/mis-citas-barbero/hoy`);
  }

  obtenerMisCitasPendientesBarbero(): Observable<any> {
    return this.http.get(`${this.apiUrl}/mis-citas-barbero/pendientes`);
  }
}
