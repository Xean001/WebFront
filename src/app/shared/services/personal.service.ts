import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CrearBarberoRequest {
  nombre: string;
  apellido?: string;
  correo: string;
  telefono?: string;
  contrasena: string;
  fechaNacimiento?: string;
  genero?: string;
  idBarberia: number;
  especialidad?: string;
  anosExperiencia?: number;
  biografia?: string;
  fechaInicioTrabajo?: string;
}

export interface BarberoPerfil {
  idPerfil: number;
  idUsuario: number;
  idBarberia: number;
  especialidad?: string;
  anosExperiencia?: number;
  biografia?: string;
  calificacionPromedio?: number;
  fechaInicioTrabajo?: string;
  activo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PersonalService {
  private apiUrl = 'https://api.fadely.me/api/personal';

  constructor(private http: HttpClient) { }

  crearBarbero(request: CrearBarberoRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/barbero`, request);
  }

  listarPersonalBarberia(idBarberia: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/barberia/${idBarberia}`);
  }

  obtenerBarberosPorBarberia(idBarberia: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/barberos/${idBarberia}`);
  }

  eliminarPersonal(idPermiso: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${idPermiso}`);
  }
}
