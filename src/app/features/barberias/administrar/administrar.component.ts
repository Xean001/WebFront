import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BarberiaService, BarberiaDTO } from '../../../shared/services/barberias.service';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-administrar-barberias',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './administrar.component.html',
  styleUrl: './administrar.component.css'
})
export class AdministrarBarberiasComponent implements OnInit {
  barberias: BarberiaDTO[] = [];
  cargando: boolean = false;
  usuarioActual: any = null;

  constructor(
    private barberiaService: BarberiaService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usuarioActual = this.authService.getCurrentUser();
    this.cargarBarberias();
  }

  cargarBarberias(): void {
    this.cargando = true;
    // Obtener solo las barberías donde el usuario es PROPIETARIO
    this.barberiaService.obtenerBarberiasPropias().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.barberias = response.data || [];
          console.log('✅ Barberías propias cargadas:', this.barberias.length);
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar barberías:', error);
        this.cargando = false;
        // Si hay error (ej: no autenticado), mostrar mensaje amigable
        if (error.status === 401 || error.status === 403) {
          console.error('Usuario no autorizado para ver barberías');
        }
      }
    });
  }

  crearBarberia(): void {
    this.router.navigate(['/auth/onboarding']);
  }

  verDetalles(idBarberia: number): void {
    this.router.navigate([`/barberias/${idBarberia}/detail`]);
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'ACTIVA':
        return 'status-activa';
      case 'INACTIVA':
        return 'status-inactiva';
      case 'SUSPENDIDA':
        return 'status-suspendida';
      default:
        return 'status-default';
    }
  }
}

