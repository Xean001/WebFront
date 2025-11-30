import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PerfilBarbero {
  idBarbero: number;
  usuario: any;
  especialidad: string;
  experiencia: number;
  calificacion: number;
  totalCitas: number;
  descripcion: string;
  urlFoto: string;
}

export interface BarberoServicio {
  idBarberoServicio: number;
  idBarbero: number;
  idServicio: number;
  precio: number;
  duracion: number;
}

export interface GaleriaBarbero {
  idFoto: number;
  idBarbero: number;
  urlFoto: string;
  descripcion: string;
  fechaCarga: string;
}

@Injectable({
  providedIn: 'root'
})
export class BarberoPerfilService {
  private apiUrl = 'https://api.fadely.me/api/barbero';

  constructor(private http: HttpClient) { }

  // Perfil
  obtenerMiPerfil(): Observable<any> {
    return this.http.get(`${this.apiUrl}/perfil`);
  }

  obtenerPerfilPublico(idBarbero: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/perfil/${idBarbero}`);
  }

  actualizarPerfil(request: PerfilBarbero): Observable<any> {
    return this.http.put(`${this.apiUrl}/perfil`, request);
  }

  // Servicios del Barbero
  asignarServicio(request: BarberoServicio): Observable<any> {
    return this.http.post(`${this.apiUrl}/servicios`, request);
  }

  listarMisServicios(): Observable<any> {
    return this.http.get(`${this.apiUrl}/servicios`);
  }

  listarServiciosBarbero(idBarbero: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${idBarbero}/servicios`);
  }

  actualizarServicio(idBarberoServicio: number, request: BarberoServicio): Observable<any> {
    return this.http.put(`${this.apiUrl}/servicios/${idBarberoServicio}`, request);
  }

  eliminarServicio(idBarberoServicio: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/servicios/${idBarberoServicio}`);
  }

  // Galería
  agregarFoto(urlFoto: string, descripcion: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/galeria`, { urlFoto, descripcion });
  }

  listarMiGaleria(): Observable<any> {
    return this.http.get(`${this.apiUrl}/galeria`);
  }

  listarGaleriaBarbero(idBarbero: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${idBarbero}/galeria`);
  }

  eliminarFoto(idFoto: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/galeria/${idFoto}`);
  }

  // Estadísticas
  obtenerEstadisticas(idBarbero: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${idBarbero}/estadisticas`);
  }
}
