import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BarberoPerfilService } from '../../../shared/services/barbero-perfil.service';
import { ServiciosService } from '../../../shared/services/servicios.service';

@Component({
  selector: 'app-gestionar-servicios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gestionar.component.html',
  styleUrl: './gestionar.component.css'
})
export class GestionarServiciosComponent implements OnInit {
  formularioServicio: FormGroup;
  servicios: any[] = [];
  serviciosDisponibles: any[] = [];
  mostrarFormulario: boolean = false;
  cargando: boolean = false;
  guardando: boolean = false;
  servicioEdicion: any = null;

  constructor(
    private fb: FormBuilder,
    private barberoPerfilService: BarberoPerfilService,
    private serviciosService: ServiciosService
  ) {
    this.formularioServicio = this.fb.group({
      idServicio: ['', Validators.required],
      precio: ['', [Validators.required, Validators.min(0)]],
      duracion: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.cargarServicios();
    this.cargarServiciosDisponibles();
  }

  cargarServicios(): void {
    this.cargando = true;
    this.barberoPerfilService.listarMisServicios().subscribe({
      next: (response) => {
        if (response.success) {
          this.servicios = response.data || [];
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar servicios:', error);
        this.cargando = false;
      }
    });
  }

  cargarServiciosDisponibles(): void {
    // Aquí necesitaríamos un endpoint que devuelva todos los servicios disponibles del catálogo
    // Por ahora, se cargarían del backend
    this.serviciosService.obtenerCategorias().subscribe({
      next: (response) => {
        if (response.success) {
          // Este endpoint devuelve categorías, necesitaríamos uno que devuelva servicios
          console.log('Servicios disponibles cargados');
        }
      },
      error: (error) => {
        console.error('Error al cargar servicios disponibles:', error);
      }
    });
  }

  abrirFormularioNuevo(): void {
    this.servicioEdicion = null;
    this.formularioServicio.reset();
    this.mostrarFormulario = true;
  }

  editarServicio(servicio: any): void {
    this.servicioEdicion = servicio;
    this.formularioServicio.patchValue({
      idServicio: servicio.idServicio,
      precio: servicio.precio,
      duracion: servicio.duracion
    });
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.formularioServicio.reset();
    this.servicioEdicion = null;
  }

  guardarServicio(): void {
    if (!this.formularioServicio.valid) {
      return;
    }

    this.guardando = true;
    const datos = {
      idServicio: this.formularioServicio.get('idServicio')?.value,
      precio: this.formularioServicio.get('precio')?.value,
      duracion: this.formularioServicio.get('duracion')?.value
    };

    if (this.servicioEdicion) {
      // Actualizar
      this.barberoPerfilService.actualizarServicio(this.servicioEdicion.idBarberoServicio, datos).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Servicio actualizado exitosamente');
            this.cargarServicios();
            this.cerrarFormulario();
          }
          this.guardando = false;
        },
        error: (error) => {
          console.error('Error al actualizar servicio:', error);
          alert('Error al actualizar el servicio');
          this.guardando = false;
        }
      });
    } else {
      // Crear nuevo
      this.barberoPerfilService.asignarServicio(datos).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Servicio creado exitosamente');
            this.cargarServicios();
            this.cerrarFormulario();
          }
          this.guardando = false;
        },
        error: (error) => {
          console.error('Error al crear servicio:', error);
          alert('Error al crear el servicio');
          this.guardando = false;
        }
      });
    }
  }

  eliminarServicio(idBarberoServicio: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
      this.barberoPerfilService.eliminarServicio(idBarberoServicio).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Servicio eliminado exitosamente');
            this.cargarServicios();
          }
        },
        error: (error) => {
          console.error('Error al eliminar servicio:', error);
          alert('Error al eliminar el servicio');
        }
      });
    }
  }
}
