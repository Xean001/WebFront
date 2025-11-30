import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Barberia {
  idBarberia: number;
  nombre: string;
  ciudad: string;
  direccion: string;
  telefono: string;
  email: string;
  urlImagen: string;
  descripcion: string;
  estado: string;
  horarioApertura: string;
  horarioCierre: string;
  aceptaReservasOnline: boolean;
  calificacion: number;
  puntuacion: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class BarberiaService {
  private apiUrl = 'https://api.fadely.me/api/barberias';

  constructor(private http: HttpClient) { }

  obtenerBarberiasActivas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/activas`);
  }

  obtenerBarberiasDisponibles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/disponibles`);
  }

  obtenerBarberiaPorId(idBarberia: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${idBarberia}`);
  }

  buscarBarberias(query: string): Observable<any> {
    const params = new HttpParams().set('query', query);
    return this.http.get(`${this.apiUrl}/buscar`, { params });
  }

  obtenerPorCiudad(ciudad: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/ciudad/${ciudad}`);
  }

  obtenerCiudades(): Observable<any> {
    return this.http.get(`${this.apiUrl}/ciudades`);
  }

  obtenerBarberiasActivasPaginadas(page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get(`${this.apiUrl}/activas/paginadas`, { params });
  }

  buscarBarberiasPaginadas(query: string, page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('query', query)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get(`${this.apiUrl}/buscar/paginadas`, { params });
  }

  crearBarberia(barberia: Barberia): Observable<any> {
    return this.http.post(`${this.apiUrl}`, barberia);
  }

  actualizarBarberia(idBarberia: number, barberia: Barberia): Observable<any> {
    return this.http.put(`${this.apiUrl}/${idBarberia}`, barberia);
  }

  cambiarEstadoBarberia(idBarberia: number, estado: string): Observable<any> {
    const params = new HttpParams().set('estado', estado);
    return this.http.put(`${this.apiUrl}/${idBarberia}/estado`, {}, { params });
  }
}
