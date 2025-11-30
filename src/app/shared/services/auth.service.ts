import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
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
  genero?: string;
}

export interface AuthResponse {
  token: string;
  tipo: string;
  idUsuario: number;
  nombre: string;
  correo: string;
  tipoUsuario: string;
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
  ) {}

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
   * Guardar datos de autenticación
   */
  private saveAuthData(response: AuthResponse): void {
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.userKey, JSON.stringify(response));
    this.currentUserSubject.next(response);
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
