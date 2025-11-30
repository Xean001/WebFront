import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface ServicioDTO {
  idServicio?: number;
  idBarberia: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  precioDesde?: boolean;
  duracionMinutos: number;
  categoria: string;
  serviciosIncluidos?: string;
  fotoUrl?: string;
  destacado?: boolean;
  activo?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Component({
  selector: 'app-servicios-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './servicios-management.component.html',
  styleUrls: ['./servicios-management.component.css']
})
export class ServiciosManagementComponent implements OnInit {
  @Input() idBarberia: number | null = null;

  servicios: ServicioDTO[] = [];
  formulario!: FormGroup;
  
  cargando: boolean = false;
  mostrarFormulario: boolean = false;
  editandoId: number | null = null;
  errores: { [key: string]: string } = {};
  
  categorias: string[] = [
    'Cortes',
    'Barbas',
    'Tratamientos',
    'Afeitados',
    'Tintes',
    'Peinados',
    'Otros'
  ];

  private apiUrl = 'https://api.fadely.me/api/servicios';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    if (this.idBarberia) {
      this.cargarServicios();
      this.inicializarFormulario();
    }
  }

  inicializarFormulario(): void {
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: [''],
      precio: ['', [Validators.required, Validators.min(0)]],
      duracionMinutos: ['', [Validators.required, Validators.min(5)]],
      categoria: ['', Validators.required],
      serviciosIncluidos: [''],
      fotoUrl: [''],
      destacado: [false],
      activo: [true]
    });
  }

  cargarServicios(): void {
    if (!this.idBarberia) return;

    this.cargando = true;
    this.http.get<ApiResponse<ServicioDTO[]>>(`${this.apiUrl}/barberia/${this.idBarberia}`)
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.servicios = response.data;
          }
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al cargar servicios:', error);
          this.cargando = false;
        }
      });
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.editandoId = null;
      this.formulario.reset({ activo: true, destacado: false });
      this.errores = {};
    }
  }

  guardarServicio(): void {
    if (this.formulario.invalid || !this.idBarberia) {
      return;
    }

    this.cargando = true;
    const datos: ServicioDTO = {
      ...this.formulario.value,
      idBarberia: this.idBarberia
    };

    if (this.editandoId) {
      // Actualizar
      this.http.put<ApiResponse<ServicioDTO>>(`${this.apiUrl}/${this.editandoId}`, datos)
        .subscribe({
          next: () => {
            alert('Servicio actualizado exitosamente');
            this.cargarServicios();
            this.toggleFormulario();
            this.cargando = false;
          },
          error: (error) => {
            console.error('Error:', error);
            this.errores['general'] = 'Error al actualizar el servicio';
            this.cargando = false;
          }
        });
    } else {
      // Crear
      this.http.post<ApiResponse<ServicioDTO>>(`${this.apiUrl}`, datos)
        .subscribe({
          next: () => {
            alert('Servicio creado exitosamente');
            this.cargarServicios();
            this.toggleFormulario();
            this.cargando = false;
          },
          error: (error) => {
            console.error('Error:', error);
            this.errores['general'] = 'Error al crear el servicio';
            this.cargando = false;
          }
        });
    }
  }

  editarServicio(servicio: ServicioDTO): void {
    this.editandoId = servicio.idServicio || null;
    this.formulario.patchValue(servicio);
    this.mostrarFormulario = true;
    this.errores = {};
  }

  eliminarServicio(idServicio: number): void {
    if (!confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
      return;
    }

    this.cargando = true;
    this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${idServicio}`)
      .subscribe({
        next: () => {
          alert('Servicio eliminado exitosamente');
          this.cargarServicios();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error:', error);
          alert('Error al eliminar el servicio');
          this.cargando = false;
        }
      });
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.formulario.reset({ activo: true, destacado: false });
    this.mostrarFormulario = false;
    this.errores = {};
  }
}
