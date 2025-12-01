import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CitasService } from '../../../shared/services/citas.service';
import { BarberiaService } from '../../../shared/services/barberias.service';
import { ServiciosService } from '../../../shared/services/servicios.service';
import { PersonalService } from '../../../shared/services/personal.service';
import { HorariosService } from '../../../shared/services/horarios.service';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DecimalPipe],
  templateUrl: './create.component.html',
  styleUrl: './create.component.css'
})
export class CreateComponent implements OnInit {
  formularioCita: FormGroup;
  barberias: any[] = [];
  servicios: any[] = [];
  barberos: any[] = [];
  horariosDisponibles: string[] = [];
  barberiaSeleccionada: any = null;
  servicioSeleccionado: any = null;
  barberoSeleccionado: any = null;
  guardando: boolean = false;
  cargandoHorarios: boolean = false;
  currentStep: number = 1;

  constructor(
    private fb: FormBuilder,
    private citasService: CitasService,
    private barberiaService: BarberiaService,
    private serviciosService: ServiciosService,
    private personalService: PersonalService,
    private horariosService: HorariosService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.formularioCita = this.fb.group({
      idBarberia: ['', Validators.required],
      idServicio: ['', Validators.required],
      idBarbero: [''],
      fechaCita: ['', Validators.required],
      horaCita: ['', Validators.required],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    this.cargarBarberias();

    // Verificar si hay una barbería preseleccionada
    this.route.queryParams.subscribe(params => {
      if (params['barberia']) {
        this.formularioCita.patchValue({ idBarberia: params['barberia'] });
        this.onBarberiaChange();
      }
    });
  }

  cargarBarberias(): void {
    this.barberiaService.obtenerBarberiasDisponibles().subscribe({
      next: (response) => {
        if (response.success) {
          this.barberias = response.data || [];
        }
      },
      error: (error) => {
      }
    });
  }

  onBarberiaChange(): void {
    const idBarberia = this.formularioCita.get('idBarberia')?.value;
    if (!idBarberia) {
      this.servicios = [];
      this.barberos = [];
      this.barberiaSeleccionada = null;
      return;
    }

    // Guardar barbería seleccionada
    this.barberiaSeleccionada = this.barberias.find(b => b.idBarberia === parseInt(idBarberia));

    // Cargar servicios de la barbería
    this.serviciosService.obtenerPorBarberia(idBarberia).subscribe({
      next: (response) => {
        if (response.success) {
          this.servicios = response.data || [];
        }
      },
      error: (error) => {
      }
    });

    // Cargar barberos de la barbería
    this.personalService.obtenerBarberosPorBarberia(idBarberia).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.barberos = response.data.filter((b: any) => b.activo && b.aceptaReservas);
        }
      },
      error: (error) => {
      }
    });

    // Limpiar selecciones previas
    this.formularioCita.patchValue({
      idServicio: '',
      idBarbero: ''
    });
  }

  onServicioChange(): void {
    const idServicio = this.formularioCita.get('idServicio')?.value;
    if (!idServicio) {
      this.servicioSeleccionado = null;
      return;
    }

    this.servicioSeleccionado = this.servicios.find(s => s.idServicio === parseInt(idServicio));
  }

  seleccionarBarbero(idBarbero: number): void {
    this.formularioCita.patchValue({ idBarbero: idBarbero });
    this.barberoSeleccionado = this.barberos.find(b => b.idBarbero === idBarbero);
  }

  onFechaChange(): void {
    const fecha = this.formularioCita.get('fechaCita')?.value;
    const idBarbero = this.formularioCita.get('idBarbero')?.value;

    if (fecha && idBarbero) {
      this.cargarHorariosDisponibles(idBarbero, fecha);
    }
  }

  cargarHorariosDisponibles(idBarbero: number, fecha: string): void {
    this.cargandoHorarios = true;
    this.horariosDisponibles = [];

    // Obtener duración del servicio seleccionado
    const duracionMinutos = this.servicioSeleccionado?.duracionMinutos || 30;

    this.horariosService.obtenerSlotsDisponibles(idBarbero, fecha, duracionMinutos).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // El backend ya devuelve los slots formateados
          this.horariosDisponibles = response.data.map((slot: any) => slot.horaInicio);
        }
        this.cargandoHorarios = false;
      },
      error: (error) => {
        this.cargandoHorarios = false;
      }
    });
  }

  // generarSlotsHorarios(disponibilidad: any): void {
  //   // Aquí deberías procesar la respuesta del backend
  //   // Por ahora genero horarios de ejemplo cada 30 minutos
  //   const horarios: string[] = [];
  //   const horaInicio = 9;
  //   const horaFin = 20;

  //   for (let hora = horaInicio; hora < horaFin; hora++) {
  //     horarios.push(`${hora.toString().padStart(2, '0')}:00`);
  //     horarios.push(`${hora.toString().padStart(2, '0')}:30`);
  //   }

  //   this.horariosDisponibles = horarios;
  // }

  getMinDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  guardarCita(): void {
    if (!this.formularioCita.valid) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    // Validar que haya barbero seleccionado
    const idBarbero = this.formularioCita.get('idBarbero')?.value;
    if (!idBarbero) {
      alert('Por favor selecciona un barbero');
      return;
    }

    this.guardando = true;

    // Convertir datos al formato que espera el backend
    const datos = {
      idBarberia: parseInt(this.formularioCita.get('idBarberia')?.value),
      idServicio: parseInt(this.formularioCita.get('idServicio')?.value),
      idBarbero: parseInt(idBarbero),
      fecha: this.formularioCita.get('fechaCita')?.value,  // Backend espera "fecha"
      horaInicio: this.formularioCita.get('horaCita')?.value,  // Backend espera "horaInicio"
      observaciones: this.formularioCita.get('observaciones')?.value || null
    };

    this.citasService.crearCita(datos).subscribe({
      next: (response) => {
        if (response.success) {
          alert('¡Cita creada exitosamente!');
          this.router.navigate(['/citas/mis-citas']);
        }
        this.guardando = false;
      },
      error: (error) => {
        const mensaje = error.error?.message || error.message || 'Error desconocido';
        alert('Error al crear la cita: ' + mensaje);
        this.guardando = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/barberias']);
  }

  nextStep(): void {
    if (this.isStepValid()) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  isStepValid(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.formularioCita.get('idBarberia')?.valid ?? false;
      case 2:
        return this.formularioCita.get('idServicio')?.valid ?? false;
      case 3:
        return true; // Optional step
      case 4:
        return (this.formularioCita.get('fechaCita')?.valid ?? false) &&
          (this.formularioCita.get('horaCita')?.valid ?? false);
      case 5:
        return true;
      default:
        return false;
    }
  }

  seleccionarHorario(horario: string): void {
    this.formularioCita.patchValue({ horaCita: horario });
  }

  /**
   * Determina si un horario es por la mañana (antes de 12:00)
   */
  esManana(horario: string): boolean {
    const hora = parseInt(horario.split(':')[0]);
    return hora >= 6 && hora < 12;
  }

  /**
   * Determina si un horario es por la tarde (12:00 - 18:00)
   */
  esTarde(horario: string): boolean {
    const hora = parseInt(horario.split(':')[0]);
    return hora >= 12 && hora < 18;
  }

  /**
   * Determina si un horario es por la noche (después de 18:00)
   */
  esNoche(horario: string): boolean {
    const hora = parseInt(horario.split(':')[0]);
    return hora >= 18;
  }

  /**
   * Obtiene el periodo del día para mostrar
   */
  obtenerPeriodo(horario: string): string {
    if (this.esManana(horario)) return 'Mañana';
    if (this.esTarde(horario)) return 'Tarde';
    if (this.esNoche(horario)) return 'Noche';
    return '';
  }
}

