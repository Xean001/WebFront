import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, AuthResponse } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  currentUser$: Observable<AuthResponse | null>;
  currentUser: AuthResponse | null = null;

  // Roles disponibles
  ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
    CLIENTE: 'CLIENTE',
    BARBERO: 'BARBERO',
    RECEPCIONISTA: 'RECEPCIONISTA'
  };

  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    // Suscribirse al observable para detectar cambios de autenticación
    this.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout(): void {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      this.authService.logout();
    }
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    return this.currentUser?.tipoUsuario === role;
  }

  /**
   * Verificar si es cliente
   */
  isCliente(): boolean {
    return this.hasRole(this.ROLES.CLIENTE);
  }

  /**
   * Verificar si es barbero
   */
  isBarbero(): boolean {
    return this.hasRole(this.ROLES.BARBERO);
  }

  /**
   * Verificar si es admin/staff
   */
  isAdmin(): boolean {
    return this.hasRole(this.ROLES.ADMIN) || this.hasRole(this.ROLES.SUPER_ADMIN) || this.hasRole(this.ROLES.RECEPCIONISTA);
  }
}
