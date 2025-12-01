import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Favorito {
  idFavorito?: number;
  idUsuario: number;
  idBarberia: number;
  fechaAgregado?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FavoritosService {
  private apiUrl = 'https://api.fadely.me/api/favoritos';

  constructor(private http: HttpClient) { }

  agregarFavorito(idBarberia: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${idBarberia}`, {});
  }

  eliminarFavorito(idBarberia: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${idBarberia}`);
  }

  obtenerMisFavoritos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/mis-favoritos`);
  }

  esFavorito(idBarberia: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/es-favorito/${idBarberia}`);
  }
}
