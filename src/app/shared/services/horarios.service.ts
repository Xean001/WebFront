import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces para Request (lo que enviamos a la API)
export interface HorarioBarberiaRequest {
  diaSemana: string; // MONDAY, TUESDAY, etc.
  horaApertura: LocalTime;
  horaCierre: LocalTime;
  cerrado?: boolean;
}

export interface HorarioBarberoRequest {
  diaSemana: string;
  horaInicio: LocalTime;
  horaFin: LocalTime;
  activo?: boolean;
}

export interface ExcepcionHorarioRequest {
  fechaInicio: string; // date format
  fechaFin: string;
  motivo: string;
  esVacaciones?: boolean;
}

export interface LocalTime {
  hour: number;
  minute: number;
  second: number;
  nano: number;
}

// Interfaces para Response (lo que recibimos de la API)
export interface HorarioBarberia {
  idHorario: number;
  barberia: any;
  diaSemana: number;
  horaInicio: LocalTime;
  horaFin: LocalTime;
  cerrado: boolean;
}

export interface HorarioBarbero {
  idHorario: number;
  barbero: any;
  diaSemana: number;
  horaInicio: LocalTime;
  horaFin: LocalTime;
  cerrado: boolean;
  activo: boolean;
}

export interface ExcepcionHorario {
  idExcepcion: number;
  barbero: any;
  barberia: any;
  fechaInicio: string;
  fechaFin: string;
  todoElDia: boolean;
  horaInicio: LocalTime;
  horaFin: LocalTime;
  cerrado: boolean;
  motivo: string;
}

@Injectable({
  providedIn: 'root'
})
export class HorariosService {
  private apiUrl = 'https://api.fadely.me/api/horarios';

  constructor(private http: HttpClient) { }

  // Horarios de Barbería
  crearHorarioBarberia(idBarberia: number, request: HorarioBarberiaRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/barberia/${idBarberia}`, request);
  }

  listarHorariosBarberia(idBarberia: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/barberia/${idBarberia}`);
  }

  actualizarHorarioBarberia(idHorario: number, request: HorarioBarberiaRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/barberia/${idHorario}`, request);
  }

  // Horarios de Barbero
  crearHorarioBarbero(request: HorarioBarberoRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/barbero`, request);
  }

  listarHorariosBarbero(idBarbero: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/barbero/${idBarbero}`);
  }

  listarMisHorarios(): Observable<any> {
    return this.http.get(`${this.apiUrl}/barbero/mis-horarios`);
  }

  actualizarHorarioBarbero(idHorario: number, request: HorarioBarberoRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/barbero/${idHorario}`, request);
  }

  eliminarHorarioBarbero(idHorario: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/barbero/${idHorario}`);
  }

  // Excepciones de Horario
  crearExcepcion(request: ExcepcionHorarioRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/excepciones`, request);
  }

  listarExcepciones(idBarbero: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/excepciones/barbero/${idBarbero}`);
  }

  listarExcepcionesEnFecha(idBarbero: number, fecha: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/excepciones/barbero/${idBarbero}/fecha/${fecha}`);
  }

  eliminarExcepcion(idExcepcion: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/excepciones/${idExcepcion}`);
  }

  // Consultas Públicas
  verificarDisponibilidad(idBarbero: number, fecha: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/barbero/${idBarbero}/disponibilidad/${fecha}`);
  }
}
