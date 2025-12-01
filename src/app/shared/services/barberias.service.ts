import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Interfaz que representa una barbería según la API
 * Campos que coinciden exactamente con el modelo del servidor
 */
export interface BarberiaDTO {
  idBarberia?: number;
  nombre: string;
  ruc?: string;
  direccion: string;
  ciudad: string;
  codigoPostal?: string;
  latitud?: number;
  longitud?: number;
  telefono: string;
  email: string;
  sitioWeb?: string;
  descripcion?: string;
  fotoPortadaUrl?: string;
  logoUrl?: string;
  estado?: 'ACTIVA' | 'INACTIVA' | 'SUSPENDIDA';
  aceptaReservasOnline?: boolean;
  verificada?: boolean;
  fechaRegistro?: string;
  fechaActualizacion?: string;
}

/**
 * Respuesta paginada del servidor
 */
export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

/**
 * Respuesta API estándar
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class BarberiaService {
  private apiUrl = 'https://api.fadely.me/api/barberias';

  constructor(private http: HttpClient) { }

  /**
   * Obtener todas las barberías activas 
   * GET /barberias/activas
   */
  obtenerBarberiasActivas(): Observable<ApiResponse<BarberiaDTO[]>> {
    return this.http.get<ApiResponse<BarberiaDTO[]>>(`${this.apiUrl}/activas`);
  }

  /**
   * Obtener barberías activas con paginación
   * GET /barberias/activas/paginadas?page=0&size=10
   */
  obtenerBarberiasActivasPaginadas(page: number = 0, size: number = 10): Observable<ApiResponse<PageResponse<BarberiaDTO>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<PageResponse<BarberiaDTO>>>(`${this.apiUrl}/activas/paginadas`, { params });
  }

  /**
   * Obtener barberías disponibles para reservas online
   * GET /barberias/disponibles
   */
  obtenerBarberiasDisponibles(): Observable<ApiResponse<BarberiaDTO[]>> {
    return this.http.get<ApiResponse<BarberiaDTO[]>>(`${this.apiUrl}/disponibles`);
  }

  /**
   * Obtener barbería por ID
   * GET /barberias/{id}
   */
  obtenerBarberiaPorId(idBarberia: number): Observable<ApiResponse<BarberiaDTO>> {
    return this.http.get<ApiResponse<BarberiaDTO>>(`${this.apiUrl}/${idBarberia}`);
  }

  /**
   * Buscar barberías por término (nombre, ciudad, dirección)
   * GET /barberias/buscar?query=termino
   */
  buscarBarberias(query: string): Observable<ApiResponse<BarberiaDTO[]>> {
    const params = new HttpParams().set('query', query);
    return this.http.get<ApiResponse<BarberiaDTO[]>>(`${this.apiUrl}/buscar`, { params });
  }

  /**
   * Buscar barberías con paginación
   * GET /barberias/buscar/paginadas?query=termino&page=0&size=10
   */
  buscarBarberiasPaginadas(query: string, page: number = 0, size: number = 10): Observable<ApiResponse<PageResponse<BarberiaDTO>>> {
    const params = new HttpParams()
      .set('query', query)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<PageResponse<BarberiaDTO>>>(`${this.apiUrl}/buscar/paginadas`, { params });
  }

  /**
   * Obtener lista de ciudades disponibles
   * GET /barberias/ciudades
   */
  obtenerCiudades(): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/ciudades`);
  }

  /**
   * Obtener barberías por ciudad específica
   * GET /barberias/ciudad/{ciudad}
   */
  obtenerPorCiudad(ciudad: string): Observable<ApiResponse<BarberiaDTO[]>> {
    return this.http.get<ApiResponse<BarberiaDTO[]>>(`${this.apiUrl}/ciudad/${ciudad}`);
  }

  /**
   * Crear una nueva barbería
   * POST /barberias
   * Requiere: Autenticación (token JWT)
   * Solo: ADMIN o SUPER_ADMIN
   */
  crearBarberia(barberia: BarberiaDTO): Observable<ApiResponse<BarberiaDTO>> {
    return this.http.post<ApiResponse<BarberiaDTO>>(`${this.apiUrl}`, barberia);
  }

  /**
   * Actualizar datos de una barbería
   * PUT /barberias/{id}
   * Requiere: Autenticación (token JWT)
   * Solo: ADMIN de esa barbería o SUPER_ADMIN
   */
  actualizarBarberia(idBarberia: number, barberia: BarberiaDTO): Observable<ApiResponse<BarberiaDTO>> {
    return this.http.put<ApiResponse<BarberiaDTO>>(`${this.apiUrl}/${idBarberia}`, barberia);
  }

  /**
   * Cambiar estado de una barbería
   * PUT /barberias/{id}/estado?estado=ACTIVA|INACTIVA|SUSPENDIDA
   * Requiere: Autenticación (token JWT)
   * Solo: ADMIN de esa barbería o SUPER_ADMIN
   * Estados válidos: ACTIVA, INACTIVA, SUSPENDIDA
   */
  cambiarEstadoBarberia(idBarberia: number, estado: 'ACTIVA' | 'INACTIVA' | 'SUSPENDIDA'): Observable<ApiResponse<void>> {
    const params = new HttpParams().set('estado', estado);
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/${idBarberia}/estado`, {}, { params });
  }

  /**
   * Obtener barberías del usuario autenticado (donde tiene algún rol)
   * GET /barberias/mis-barberias
   * Requiere: Autenticación (token JWT)
   */
  obtenerMisBarberias(): Observable<ApiResponse<BarberiaDTO[]>> {
    return this.http.get<ApiResponse<BarberiaDTO[]>>(`${this.apiUrl}/mis-barberias`);
  }

  /**
   * Obtener barberías propias del usuario autenticado (donde es PROPIETARIO)
   * GET /barberias/mis-barberias-propias
   * Requiere: Autenticación (token JWT)
   * Solo: ADMIN o SUPER_ADMIN
   */
  obtenerBarberiasPropias(): Observable<ApiResponse<BarberiaDTO[]>> {
    return this.http.get<ApiResponse<BarberiaDTO[]>>(`${this.apiUrl}/mis-barberias-propias`);
  }
}
