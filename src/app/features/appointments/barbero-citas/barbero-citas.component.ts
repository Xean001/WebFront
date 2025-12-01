import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CitasService } from '../../../shared/services/citas.service';

@Component({
  selector: 'app-barbero-citas',
  imports: [CommonModule],
  templateUrl: './barbero-citas.component.html',
  styleUrl: './barbero-citas.component.css'
})
export class BarberoCitasComponent implements OnInit {
  citas: any[] = [];
  citasFiltradas: any[] = [];
  filtroEstado: string = 'TODAS';
  cargando = false;
  error = '';

  contadores = {
    todas: 0,
    confirmadas: 0,
    pendientes: 0,
    completadas: 0,
    canceladas: 0
  };

  constructor(private citasService: CitasService) { }

  ngOnInit(): void {
    this.cargarCitas();
  }

  cargarCitas(): void {
    this.cargando = true;
    this.error = '';

    this.citasService.obtenerMisCitasBarbero().subscribe({
      next: (response) => {
        this.citas = response.data || [];
        this.calcularContadores();
        this.aplicarFiltro();
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar las citas';
        this.cargando = false;
        console.error('Error:', err);
      }
    });
  }

  calcularContadores(): void {
    this.contadores.todas = this.citas.length;
    this.contadores.confirmadas = this.citas.filter(c => c.estado === 'CONFIRMADA').length;
    this.contadores.pendientes = this.citas.filter(c => c.estado === 'PENDIENTE').length;
    this.contadores.completadas = this.citas.filter(c => c.estado === 'COMPLETADA').length;
    this.contadores.canceladas = this.citas.filter(c => c.estado === 'CANCELADA').length;
  }

  filtrarPorEstado(estado: string): void {
    this.filtroEstado = estado;
    this.aplicarFiltro();
  }

  aplicarFiltro(): void {
    if (this.filtroEstado === 'TODAS') {
      this.citasFiltradas = [...this.citas];
    } else {
      this.citasFiltradas = this.citas.filter(c => c.estado === this.filtroEstado);
    }
  }

  confirmarCita(idCita: number): void {
    if (confirm('¿Confirmar esta cita?')) {
      this.citasService.confirmarCita(idCita).subscribe({
        next: () => {
          this.cargarCitas();
        },
        error: (err) => {
          alert('Error al confirmar la cita');
          console.error('Error:', err);
        }
      });
    }
  }

  completarCita(idCita: number): void {
    if (confirm('¿Marcar esta cita como completada?')) {
      this.citasService.marcarComoCompletada(idCita).subscribe({
        next: () => {
          this.cargarCitas();
        },
        error: (err) => {
          alert('Error al completar la cita');
          console.error('Error:', err);
        }
      });
    }
  }

  cancelarCita(idCita: number): void {
    const motivo = prompt('¿Motivo de cancelación? (opcional)');
    if (motivo !== null) {
      this.citasService.cancelarCita(idCita, motivo).subscribe({
        next: () => {
          this.cargarCitas();
        },
        error: (err) => {
          alert('Error al cancelar la cita');
          console.error('Error:', err);
        }
      });
    }
  }
}
