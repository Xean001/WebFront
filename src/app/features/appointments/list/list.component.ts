import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CitasService } from '../../../shared/services/citas.service';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})
export class ListComponent implements OnInit {
  citas: any[] = [];
  citasFiltradas: any[] = [];
  filtroEstado: string = 'TODAS';
  cargando: boolean = false;
  contadores = {
    todas: 0,
    confirmadas: 0,
    pendientes: 0,
    canceladas: 0,
    completadas: 0
  };

  constructor(private citasService: CitasService) { }

  ngOnInit(): void {
    this.cargarCitas();
  }

  cargarCitas(): void {
    this.cargando = true;
    this.citasService.obtenerMisCitas().subscribe({
      next: (response) => {
        if (response.success) {
          this.citas = response.data || [];
          this.calcularContadores();
          this.aplicarFiltro();
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar citas:', error);
        this.cargando = false;
      }
    });
  }

  calcularContadores(): void {
    this.contadores.todas = this.citas.length;
    this.contadores.confirmadas = this.citas.filter(c => c.estado === 'CONFIRMADA').length;
    this.contadores.pendientes = this.citas.filter(c => c.estado === 'PENDIENTE').length;
    this.contadores.canceladas = this.citas.filter(c => c.estado === 'CANCELADA').length;
    this.contadores.completadas = this.citas.filter(c => c.estado === 'COMPLETADA').length;
  }

  filtrarPorEstado(estado: string): void {
    this.filtroEstado = estado;
    this.aplicarFiltro();
  }

  aplicarFiltro(): void {
    if (this.filtroEstado === 'TODAS') {
      this.citasFiltradas = this.citas;
    } else {
      this.citasFiltradas = this.citas.filter(c => c.estado === this.filtroEstado);
    }
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'CONFIRMADA':
        return 'bg-success';
      case 'PENDIENTE':
        return 'bg-warning text-dark';
      case 'CANCELADA':
        return 'bg-danger';
      case 'COMPLETADA':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  }

  verDetalle(idCita: number): void {
    // Implementar navegación a detalle
    console.log('Ver detalle de cita:', idCita);
  }

  cancelarCita(idCita: number): void {
    const motivo = prompt('¿Por qué deseas cancelar esta cita?');
    if (!motivo) return;

    this.citasService.cancelarCita(idCita, motivo).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Cita cancelada exitosamente');
          this.cargarCitas();
        }
      },
      error: (error) => {
        console.error('Error al cancelar cita:', error);
        alert('Error al cancelar la cita');
      }
    });
  }
}

