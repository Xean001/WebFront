import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HorarioBarberia {
  idHorario: number;
  idBarberia: number;
  diaSemana: string;
  horaApertura: string;
  horaCierre: string;
  descanso: boolean;
}

export interface HorarioBarbero {
  idHorario: number;
  idBarbero: number;
  diaSemana: string;
  horaApertura: string;
  horaCierre: string;
  descanso: boolean;
}

export interface ExcepcionHorario {
  idExcepcion: number;
  idBarbero: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  motivo: string;
  tipo: string;
}

@Injectable({
  providedIn: 'root'
})
export class HorariosService {
  private apiUrl = 'https://api.fadely.me/api/horarios';

  constructor(private http: HttpClient) { }

  // Horarios de Barbería
  crearHorarioBarberia(idBarberia: number, request: HorarioBarberia): Observable<any> {
    return this.http.post(`${this.apiUrl}/barberia/${idBarberia}`, request);
  }

  listarHorariosBarberia(idBarberia: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/barberia/${idBarberia}`);
  }

  actualizarHorarioBarberia(idHorario: number, request: HorarioBarberia): Observable<any> {
    return this.http.put(`${this.apiUrl}/barberia/${idHorario}`, request);
  }

  // Horarios de Barbero
  crearHorarioBarbero(request: HorarioBarbero): Observable<any> {
    return this.http.post(`${this.apiUrl}/barbero`, request);
  }

  listarHorariosBarbero(idBarbero: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/barbero/${idBarbero}`);
  }

  listarMisHorarios(): Observable<any> {
    return this.http.get(`${this.apiUrl}/barbero/mis-horarios`);
  }

  actualizarHorarioBarbero(idHorario: number, request: HorarioBarbero): Observable<any> {
    return this.http.put(`${this.apiUrl}/barbero/${idHorario}`, request);
  }

  eliminarHorarioBarbero(idHorario: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/barbero/${idHorario}`);
  }

  // Excepciones de Horario
  crearExcepcion(request: ExcepcionHorario): Observable<any> {
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
