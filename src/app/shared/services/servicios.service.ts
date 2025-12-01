import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Servicio {
  idServicio: number;
  idBarberia: number;
  nombre: string;
  descripcion: string;
  precio: number;
  precioDesde?: boolean;
  duracionMinutos: number;
  categoria: string;
  serviciosIncluidos?: string | null;
  fotoUrl?: string | null;
  destacado: boolean;
  activo?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ServiciosService {
  private apiUrl = 'https://api.fadely.me/api/servicios';

  constructor(private http: HttpClient) { }

  obtenerPorBarberia(idBarberia: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/barberia/${idBarberia}`);
  }

  obtenerDestacados(): Observable<any> {
    return this.http.get(`${this.apiUrl}/destacados`);
  }

  obtenerPorId(idServicio: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${idServicio}`);
  }

  obtenerCategorias(): Observable<any> {
    return this.http.get(`${this.apiUrl}/categorias`);
  }

  crearServicio(servicio: Servicio): Observable<any> {
    return this.http.post(`${this.apiUrl}`, servicio);
  }

  actualizarServicio(idServicio: number, servicio: Servicio): Observable<any> {
    return this.http.put(`${this.apiUrl}/${idServicio}`, servicio);
  }

  eliminarServicio(idServicio: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${idServicio}`);
  }
}
