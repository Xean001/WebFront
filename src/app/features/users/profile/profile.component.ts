import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, AuthResponse } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  currentUser: AuthResponse | null = null;
  cargando: boolean = false;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  editarPerfil(): void {
    console.log('Editar perfil');
    // Navegar a edit-profile
  }

  cambiarContrasena(): void {
    console.log('Cambiar contraseña');
  }

  logout(): void {
    if (confirm('¿Deseas cerrar sesión?')) {
      this.authService.logout();
    }
  }
}

