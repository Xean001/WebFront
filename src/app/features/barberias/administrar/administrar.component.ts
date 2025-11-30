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
    // Obtener todas las barberías activas y luego filtrar las del usuario actual
    // En un caso real, habría un endpoint para obtener barberías por admin
    this.barberiaService.obtenerBarberiasActivas().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Por ahora mostramos todas las barberías activas
          // En producción, deberías tener un endpoint específico para barberías del admin
          this.barberias = response.data || [];
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar barberías:', error);
        this.cargando = false;
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

