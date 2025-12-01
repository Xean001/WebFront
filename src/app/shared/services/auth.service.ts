import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, switchMap, of } from 'rxjs';
import { Router } from '@angular/router';

export interface LoginRequest {
  correo: string;
  contrasena: string;
}

export interface RegisterRequest {
  nombre: string;
  apellido?: string;
  correo: string;
  telefono?: string;
  contrasena: string;
  fechaNacimiento?: string;
  genero?: 'MASCULINO' | 'FEMENINO' | 'OTRO' | 'PREFIERO_NO_DECIR';
}

export interface RegisterAdminRequest {
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  contrasena: string;
  fechaNacimiento: string;
  genero: 'MASCULINO' | 'FEMENINO' | 'OTRO';
  fotoPerfilUrl?: string;
  tipoPlan?: string;
}

export interface AuthResponse {
  token: string;
  tipo: string;
  idUsuario: number;
  nombre: string;
  correo: string;
  tipoUsuario: string;
  idBarberia: number;
  idSuscripcion?: number;
  tipoPlan?: string;
  estadoSuscripcion?: 'PENDIENTE_PAGO' | 'ACTIVA' | 'PAUSADA' | 'CANCELADA';
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ErrorResponse {
  status: number;
  error: string;
  message: string;
  path: string;
  validationErrors?: { [key: string]: string };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://api.fadely.me/api/auth';
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  /**
   * Registrar un nuevo usuario
   */
  register(request: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/registro`, request).pipe(
      tap(response => {
        if (response.data) {
          this.saveAuthData(response.data);
        }
      })
    );
  }

  /**
   * Registrar un nuevo administrador/barbería
   * POST /api/auth/admin/registro
   * Sin autenticación - Público
   */
  registrarAdmin(request: RegisterAdminRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/admin/registro`, request).pipe(
      tap(response => {
        if (response.data) {
          this.saveAuthData(response.data);
        }
      })
    );
  }

  /**
   * Iniciar sesión
   */
  login(request: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, request).pipe(
      tap(response => {
        if (response.data) {
          this.saveAuthData(response.data);
        }
      })
    );
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  /**
   * Obtener el token almacenado
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Obtener el usuario actual
   */
  getCurrentUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.tipoUsuario === role;
  }

  /**
   * Obtener el ID de la barbería del usuario actual
   */
  getBarberiaId(): number | null {
    const user = this.getCurrentUser();
    return user?.idBarberia || null;
  }

  /**
   * Actualizar el ID de la barbería en el usuario actual (después de crear organización)
   */
  setBarberiaId(idBarberia: number): void {
    const user = this.getCurrentUser();
    if (user) {
      user.idBarberia = idBarberia;
      localStorage.setItem(this.userKey, JSON.stringify(user));
      this.currentUserSubject.next(user);
    }
  }

  /**
   * Guardar datos de autenticación
   */
  private saveAuthData(response: AuthResponse): void {
    // Si el usuario no tiene estado de suscripción definido, asignar PENDIENTE_PAGO
    if (!response.estadoSuscripcion) {
      response.estadoSuscripcion = 'PENDIENTE_PAGO';
    }

    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.userKey, JSON.stringify(response));
    this.currentUserSubject.next(response);
  }

  /**
   * Refrescar usuario desde localStorage
   */
  refreshUserFromStorage(): void {
    const user = this.getUserFromStorage();
    this.currentUserSubject.next(user);
  }

  /**
   * Verificar y refrescar el estado de suscripción desde el backend
   * Útil para cuando el admin aprueba el pago y necesitamos actualizar el estado
   */
  verificarEstadoSuscripcion(): Observable<ApiResponse<AuthResponse>> {
    return this.http.get<ApiResponse<AuthResponse>>(`${this.apiUrl}/verificar-estado`).pipe(
      switchMap(response => {
        if (response.success && response.data) {

          // Si estadoSuscripcion viene undefined/null, usar fallback
          if (!response.data.estadoSuscripcion) {

            return this.http.get<ApiResponse<any>>('https://api.fadely.me/api/suscripciones/mi-suscripcion').pipe(
              tap(suscripcionResp => {
                if (suscripcionResp.success && suscripcionResp.data) {

                  // Actualizar response.data con datos de suscripción
                  response.data.estadoSuscripcion = suscripcionResp.data.estado;
                  response.data.idSuscripcion = suscripcionResp.data.idSuscripcion;
                  response.data.tipoPlan = suscripcionResp.data.tipoPlan;

                  // Actualizar localStorage
                  const currentUser = this.getCurrentUser();
                  if (currentUser) {
                    const updatedUser = {
                      ...currentUser,
                      estadoSuscripcion: suscripcionResp.data.estado,
                      idSuscripcion: suscripcionResp.data.idSuscripcion,
                      tipoPlan: suscripcionResp.data.tipoPlan
                    };
                    localStorage.setItem(this.userKey, JSON.stringify(updatedUser));
                    this.currentUserSubject.next(updatedUser);
                  }
                }
              }),
              switchMap(() => of(response)) // Devolver response original ya actualizado
            );
          }

          // Si estadoSuscripcion SÍ viene, actualizar localStorage normalmente
          const currentUser = this.getCurrentUser();
          if (currentUser) {
            const updatedUser = {
              ...currentUser,
              estadoSuscripcion: response.data.estadoSuscripcion,
              idSuscripcion: response.data.idSuscripcion,
              tipoPlan: response.data.tipoPlan
            };
            localStorage.setItem(this.userKey, JSON.stringify(updatedUser));
            this.currentUserSubject.next(updatedUser);
          }
        }

        return of(response);
      })
    );
  }

  /**
   * Actualizar estado de suscripción de un usuario
   */
  actualizarEstadoSuscripcion(idUsuario: number, nuevoEstado: 'PENDIENTE_PAGO' | 'ACTIVA' | 'PAUSADA' | 'CANCELADA'): void {
    const userJson = localStorage.getItem(this.userKey);
    if (userJson) {
      try {
        const user = JSON.parse(userJson) as AuthResponse;
        // Solo actualizar si es el usuario actual
        if (user.idUsuario === idUsuario) {
          user.estadoSuscripcion = nuevoEstado;
          localStorage.setItem(this.userKey, JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
      } catch (e) {
      }
    }
  }

  /**
   * Obtener usuario del almacenamiento local
   */
  private getUserFromStorage(): AuthResponse | null {
    const userJson = localStorage.getItem(this.userKey);
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch (e) {
        return null;
      }
    }
    return null;
  }
}
