import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CitasService } from '../../../shared/services/citas.service';

@Component({
  selector: 'app-administrar-citas',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './administrar.component.html',
  styleUrl: './administrar.component.css'
})
export class AdministrarCitasComponent implements OnInit {
  citas: any[] = [];
  citasFiltradas: any[] = [];
  busqueda: string = '';
  filtroEstado: string = '';
  filtroFecha: string = '';
  cargando: boolean = false;
  citaSeleccionada: any = null;
  idBarberia: number = 0; // Se obtendría del usuario autenticado

  constructor(private citasService: CitasService) { }

  ngOnInit(): void {
    this.cargarCitas();
  }

  cargarCitas(): void {
    this.cargando = true;
    // Usar obtenerCitasPorBarberia si es barbero, o obtenerCitasPorBarberia si es admin
    this.citasService.obtenerCitasPorBarberia(this.idBarberia).subscribe({
      next: (response) => {
        if (response.success) {
          this.citas = response.data || [];
          this.aplicarFiltros();
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar citas:', error);
        this.cargando = false;
      }
    });
  }

  aplicarFiltros(): void {
    let resultado = this.citas;

    // Filtrar por búsqueda
    if (this.busqueda.trim()) {
      const search = this.busqueda.toLowerCase();
      resultado = resultado.filter(c =>
        c.codigoReserva.toLowerCase().includes(search) ||
        c.cliente.nombre.toLowerCase().includes(search)
      );
    }

    // Filtrar por estado
    if (this.filtroEstado) {
      resultado = resultado.filter(c => c.estado === this.filtroEstado);
    }

    // Filtrar por fecha
    if (this.filtroFecha) {
      resultado = resultado.filter(c => c.fechaCita === this.filtroFecha);
    }

    this.citasFiltradas = resultado;
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

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'CONFIRMADA':
        return 'success';
      case 'PENDIENTE':
        return 'warning';
      case 'CANCELADA':
        return 'danger';
      case 'COMPLETADA':
        return 'info';
      default:
        return 'secondary';
    }
  }

  verDetalles(cita: any): void {
    this.citaSeleccionada = cita;
  }

  confirmarCita(idCita: number): void {
    if (confirm('¿Estás seguro de que deseas confirmar esta cita?')) {
      this.citasService.confirmarCita(idCita).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Cita confirmada exitosamente');
            this.cargarCitas();
            this.citaSeleccionada = null;
          }
        },
        error: (error) => {
          console.error('Error al confirmar cita:', error);
          alert('Error al confirmar la cita');
        }
      });
    }
  }

  marcarCompletada(idCita: number): void {
    if (confirm('¿Estás seguro de que deseas marcar esta cita como completada?')) {
      this.citasService.marcarComoCompletada(idCita).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Cita marcada como completada');
            this.cargarCitas();
            this.citaSeleccionada = null;
          }
        },
        error: (error) => {
          console.error('Error al marcar cita como completada:', error);
          alert('Error al marcar la cita');
        }
      });
    }
  }

  cancelarCita(idCita: number): void {
    const motivo = prompt('¿Por qué deseas cancelar esta cita?');
    if (!motivo) return;

    this.citasService.cancelarCita(idCita, motivo).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Cita cancelada exitosamente');
          this.cargarCitas();
          this.citaSeleccionada = null;
        }
      },
      error: (error) => {
        console.error('Error al cancelar cita:', error);
        alert('Error al cancelar la cita');
      }
    });
  }
}
