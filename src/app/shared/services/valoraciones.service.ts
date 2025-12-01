import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CrearValoracionRequest {
  idCita: number;
  puntuacionGeneral: number;
  comentario?: string;
}

export interface Valoracion {
  idValoracion: number;
  idCita: number;
  idCliente: number;
  idBarbero: number;
  idBarberia: number;
  puntuacionGeneral: number;
  comentario?: string;
  respuestaBarberia?: string;
  fechaRespuesta?: string;
  publicado: boolean;
  fechaCreacion: string;
  clienteNombre?: string;
  clienteApellido?: string;
  clienteFotoUrl?: string;
  nombreBarbero?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ValoracionesService {
  private apiUrl = 'https://api.fadely.me/api/valoraciones';

  constructor(private http: HttpClient) { }

  crearValoracion(request: CrearValoracionRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}`, request);
  }

  obtenerValoracionesBarberia(idBarberia: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/barberia/${idBarberia}`);
  }

  obtenerValoracionesBarbero(idBarbero: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/barbero/${idBarbero}`);
  }

  obtenerMisValoraciones(): Observable<any> {
    return this.http.get(`${this.apiUrl}/mis-valoraciones`);
  }

  obtenerValoracionPorCita(idCita: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/cita/${idCita}`);
  }

  responderValoracion(idValoracion: number, respuesta: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${idValoracion}/responder?respuesta=${encodeURIComponent(respuesta)}`, {});
  }

  eliminarValoracion(idValoracion: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${idValoracion}`);
  }
}
