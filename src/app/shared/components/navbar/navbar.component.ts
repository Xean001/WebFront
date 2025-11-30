import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService, AuthResponse } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  isMenuOpen: boolean = false;
  currentUser$: Observable<AuthResponse | null>;
  currentUser: AuthResponse | null = null;
  isAuthenticated: boolean = false;

  // Roles disponibles
  ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
    CLIENTE: 'CLIENTE',
    BARBERO: 'BARBERO',
    RECEPCIONISTA: 'RECEPCIONISTA'
  };

  constructor(
    public authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    // Suscribirse al observable de usuario actual
    this.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAuthenticated = !!user;
      console.log('Navbar actualizado - Usuario autenticado:', this.isAuthenticated, 'Rol:', user?.tipoUsuario);
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  logout(): void {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      this.authService.logout();
      this.closeMenu();
      this.router.navigate(['/dashboard']);
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
