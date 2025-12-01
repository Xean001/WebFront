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
        console.error('Error al cargar barberías:', error);
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
        console.error('Error al cargar servicios:', error);
      }
    });

    // Cargar barberos de la barbería
    this.personalService.obtenerBarberosPorBarberia(idBarberia).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.barberos = response.data.filter((b: any) => b.activo && b.aceptaReservas);
          console.log('Barberos cargados:', this.barberos);
        }
      },
      error: (error) => {
        console.error('Error al cargar barberos:', error);
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

    this.horariosService.verificarDisponibilidad(idBarbero, fecha).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Generar slots de horarios disponibles
          this.generarSlotsHorarios(response.data);
        }
        this.cargandoHorarios = false;
      },
      error: (error) => {
        console.error('Error al cargar horarios:', error);
        this.cargandoHorarios = false;
      }
    });
  }

  generarSlotsHorarios(disponibilidad: any): void {
    // Aquí deberías procesar la respuesta del backend
    // Por ahora genero horarios de ejemplo cada 30 minutos
    const horarios: string[] = [];
    const horaInicio = 9;
    const horaFin = 20;
    
    for (let hora = horaInicio; hora < horaFin; hora++) {
      horarios.push(`${hora.toString().padStart(2, '0')}:00`);
      horarios.push(`${hora.toString().padStart(2, '0')}:30`);
    }
    
    this.horariosDisponibles = horarios;
  }

  getMinDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  guardarCita(): void {
    if (!this.formularioCita.valid) {
      return;
    }

    this.guardando = true;
    const datos = {
      idBarberia: this.formularioCita.get('idBarberia')?.value,
      idServicio: this.formularioCita.get('idServicio')?.value,
      idBarbero: this.formularioCita.get('idBarbero')?.value || null,
      fechaCita: this.formularioCita.get('fechaCita')?.value,
      horaCita: this.formularioCita.get('horaCita')?.value,
      observaciones: this.formularioCita.get('observaciones')?.value
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
        console.error('Error al crear cita:', error);
        alert('Error al crear la cita: ' + error.error?.message || error.message);
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
}

