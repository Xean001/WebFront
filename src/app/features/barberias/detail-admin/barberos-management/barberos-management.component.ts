import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface UsuarioBarberia {
  idPermiso?: number;
  usuario: {
    idUsuario: number;
    nombre: string;
    apellido: string;
    correo: string;
  };
  barberia?: {
    idBarberia: number;
    nombre: string;
  };
  rol: string;
  puedeEditarServicios: boolean;
  puedeGestionarCitas: boolean;
  puedeVerReportes: boolean;
  puedeGestionarBarberos: boolean;
  fechaAsignacion?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Component({
  selector: 'app-barberos-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './barberos-management.component.html',
  styleUrls: ['./barberos-management.component.css']
})
export class BarberosManagementComponent implements OnInit {
  @Input() idBarberia: number | null = null;

  staff: UsuarioBarberia[] = [];
  formularioPermisos!: FormGroup;
  
  cargando: boolean = false;
  editandoId: number | null = null;
  errores: { [key: string]: string } = {};

  roles: string[] = ['PROPIETARIO', 'ADMINISTRADOR', 'BARBERO', 'RECEPCIONISTA'];

  private apiUrl = 'https://api.fadely.me/api/personal';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    if (this.idBarberia) {
      this.cargarStaff();
      this.inicializarFormulario();
    }
  }

  inicializarFormulario(): void {
    this.formularioPermisos = this.fb.group({
      rol: ['', Validators.required],
      puedeEditarServicios: [false],
      puedeGestionarCitas: [false],
      puedeVerReportes: [false],
      puedeGestionarBarberos: [false]
    });
  }

  cargarStaff(): void {
    if (!this.idBarberia) return;

    this.cargando = true;
    this.http.get<ApiResponse<UsuarioBarberia[]>>(`${this.apiUrl}/barberia/${this.idBarberia}`)
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.staff = response.data;
          }
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al cargar staff:', error);
          this.cargando = false;
        }
      });
  }

  editarPermisos(miembro: UsuarioBarberia): void {
    this.editandoId = miembro.idPermiso || null;
    this.formularioPermisos.patchValue({
      rol: miembro.rol,
      puedeEditarServicios: miembro.puedeEditarServicios,
      puedeGestionarCitas: miembro.puedeGestionarCitas,
      puedeVerReportes: miembro.puedeVerReportes,
      puedeGestionarBarberos: miembro.puedeGestionarBarberos
    });
  }

  guardarPermisos(idUsuario: number): void {
    if (this.formularioPermisos.invalid || !this.idBarberia) {
      return;
    }

    this.cargando = true;
    const datos = this.formularioPermisos.value;

    this.http.put<ApiResponse<UsuarioBarberia>>(
      `${this.apiUrl}/${idUsuario}/barberia/${this.idBarberia}/permisos`,
      datos
    ).subscribe({
      next: () => {
        alert('Permisos actualizados exitosamente');
        this.cargarStaff();
        this.editandoId = null;
        this.formularioPermisos.reset();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.errores['general'] = 'Error al actualizar los permisos';
        this.cargando = false;
      }
    });
  }

  eliminarStaff(idUsuario: number): void {
    if (!confirm('¿Estás seguro de que deseas eliminar a este miembro del staff?')) {
      return;
    }

    if (!this.idBarberia) return;

    this.cargando = true;
    this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${idUsuario}/barberia/${this.idBarberia}`)
      .subscribe({
        next: () => {
          alert('Miembro del staff eliminado exitosamente');
          this.cargarStaff();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error:', error);
          alert('Error al eliminar el miembro del staff');
          this.cargando = false;
        }
      });
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.formularioPermisos.reset();
    this.errores = {};
  }

  getRolBadgeClass(rol: string): string {
    const classes: { [key: string]: string } = {
      'PROPIETARIO': 'badge-owner',
      'ADMINISTRADOR': 'badge-admin',
      'BARBERO': 'badge-barber',
      'RECEPCIONISTA': 'badge-receptionist'
    };
    return classes[rol] || 'badge-default';
  }
}
