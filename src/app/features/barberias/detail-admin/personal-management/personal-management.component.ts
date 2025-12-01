import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PersonalService, CrearBarberoRequest, BarberoPerfil } from '../../../../shared/services/personal.service';

@Component({
  selector: 'app-personal-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './personal-management.component.html',
  styleUrls: ['./personal-management.component.css']
})
export class PersonalManagementComponent implements OnInit {
  @Input() idBarberia: number | null = null;

  barberos: any[] = [];
  formulario!: FormGroup;
  
  cargando: boolean = false;
  mostrarFormulario: boolean = false;
  errores: { [key: string]: string } = {};

  constructor(
    private fb: FormBuilder,
    private personalService: PersonalService
  ) {}

  ngOnInit(): void {
    if (this.idBarberia) {
      this.cargarBarberos();
      this.inicializarFormulario();
    }
  }

  inicializarFormulario(): void {
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: [''],
      correo: ['', [Validators.required, Validators.email]],
      telefono: [''],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      especialidad: [''],
      anosExperiencia: [0, [Validators.min(0)]],
      biografia: [''],
      fechaInicioTrabajo: ['']
    });
  }

  cargarBarberos(): void {
    if (!this.idBarberia) return;

    this.cargando = true;
    this.personalService.obtenerBarberosPorBarberia(this.idBarberia)
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.barberos = response.data;
          }
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al cargar barberos:', error);
          this.cargando = false;
        }
      });
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.formulario.reset({ anosExperiencia: 0 });
      this.errores = {};
    }
  }

  guardarBarbero(): void {
    if (this.formulario.invalid || !this.idBarberia) {
      Object.keys(this.formulario.controls).forEach(key => {
        const control = this.formulario.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.cargando = true;
    const datos: CrearBarberoRequest = {
      ...this.formulario.value,
      idBarberia: this.idBarberia
    };

    console.log('📤 Barbero a crear:', datos);

    this.personalService.crearBarbero(datos)
      .subscribe({
        next: (response) => {
          if (response.success) {
            alert('Barbero creado exitosamente');
            this.cargarBarberos();
            this.toggleFormulario();
          }
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error:', error);
          this.errores['general'] = error.error?.message || 'Error al crear el barbero';
          this.cargando = false;
        }
      });
  }

  eliminarBarbero(barbero: any): void {
    if (!confirm(`¿Estás seguro de eliminar a ${barbero.nombreUsuario}?`)) {
      return;
    }

    this.cargando = true;
    this.personalService.eliminarPersonal(barbero.idPermiso)
      .subscribe({
        next: () => {
          alert('Barbero eliminado exitosamente');
          this.cargarBarberos();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error:', error);
          alert('Error al eliminar el barbero');
          this.cargando = false;
        }
      });
  }

  cancelar(): void {
    this.formulario.reset({ anosExperiencia: 0 });
    this.mostrarFormulario = false;
    this.errores = {};
  }

  // Getters para validaciones
  get nombreInvalido() {
    const control = this.formulario.get('nombre');
    return control?.invalid && control?.touched;
  }

  get correoInvalido() {
    const control = this.formulario.get('correo');
    return control?.invalid && control?.touched;
  }

  get contrasenaInvalida() {
    const control = this.formulario.get('contrasena');
    return control?.invalid && control?.touched;
  }
}
