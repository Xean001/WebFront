import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CitasService } from '../../../shared/services/citas.service';
import { BarberiaService } from '../../../shared/services/barberias.service';
import { ServiciosService } from '../../../shared/services/servicios.service';
import { BarberoPerfilService } from '../../../shared/services/barbero-perfil.service';

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
  barberiaSeleccionada: any = null;
  servicioSeleccionado: any = null;
  guardando: boolean = false;
  currentStep: number = 1;

  constructor(
    private fb: FormBuilder,
    private citasService: CitasService,
    private barberiaService: BarberiaService,
    private serviciosService: ServiciosService,
    private barberoPerfilService: BarberoPerfilService,
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

