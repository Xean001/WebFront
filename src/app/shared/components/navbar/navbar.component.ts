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
  isAuthenticated: boolean = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    // Suscribirse al observable de usuario actual
    this.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
      console.log('Navbar actualizado - Usuario autenticado:', this.isAuthenticated);
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.closeMenu();
    this.router.navigate(['/dashboard']);
  }
}
