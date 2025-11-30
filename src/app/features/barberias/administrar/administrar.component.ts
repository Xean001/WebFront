import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { BarberiaService } from '../../../shared/services/barberias.service';

@Component({
  selector: 'app-administrar-barberias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './administrar.component.html',
  styleUrl: './administrar.component.css'
})
export class AdministrarBarberiasComponent implements OnInit {
  barberias: any[] = [];
  barberiasFiltradas: any[] = [];
  formulario: FormGroup;
  editandoId: number | null = null;
  cargando: boolean = false;
  mostrarFormulario: boolean = false;
  filtroEstado: string = '';
  busqueda: string = '';

  constructor(
    private barberiaService: BarberiaService,
    private fb: FormBuilder
  ) {
    this.formulario = this.crearFormulario();
  }

  ngOnInit(): void {
    this.cargarBarberias();
  }

  crearFormulario(): FormGroup {
    return this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      ruc: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      direccion: ['', Validators.required],
      ciudad: ['', Validators.required],
      codigoPostal: [''],
      latitud: ['', Validators.pattern(/^-?\d+(\.\d+)?$/)],
      longitud: ['', Validators.pattern(/^-?\d+(\.\d+)?$/)],
      telefono: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      sitioWeb: ['', Validators.pattern(/^(https?:\/\/)?.+/)],
      descripcion: ['', Validators.maxLength(500)],
      fotoPortadaUrl: [''],
      logoUrl: [''],
      aceptaReservasOnline: [true]
    });
  }

  cargarBarberias(): void {
    this.cargando = true;
    this.barberiaService.obtenerBarberiasActivas().subscribe({
      next: (response) => {
        if (response.success || response.data) {
          this.barberias = Array.isArray(response.data) ? response.data : response.data.content || [];
          this.aplicarFiltros();
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar barberías:', error);
        alert('Error al cargar barberías');
        this.cargando = false;
      }
    });
  }

  aplicarFiltros(): void {
    let resultado = this.barberias;

    if (this.busqueda.trim()) {
      const search = this.busqueda.toLowerCase();
      resultado = resultado.filter(b =>
        b.nombre.toLowerCase().includes(search) ||
        b.ciudad.toLowerCase().includes(search) ||
        b.email.toLowerCase().includes(search)
      );
    }

    if (this.filtroEstado) {
      resultado = resultado.filter(b => b.estado === this.filtroEstado);
    }

    this.barberiasFiltradas = resultado;
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.editandoId = null;
      this.formulario.reset({ aceptaReservasOnline: true });
    }
  }

  guardarBarberia(): void {
    if (this.formulario.invalid) {
      alert('Por favor completa todos los campos requeridos correctamente');
      return;
    }

    this.cargando = true;
    const datos = this.formulario.value;

    if (this.editandoId) {
      // Actualizar
      this.barberiaService.actualizarBarberia(this.editandoId, datos).subscribe({
        next: () => {
          alert('Barbería actualizada exitosamente');
          this.cargarBarberias();
          this.toggleFormulario();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al actualizar barbería:', error);
          alert('Error al actualizar la barbería');
          this.cargando = false;
        }
      });
    } else {
      // Crear
      this.barberiaService.crearBarberia(datos).subscribe({
        next: () => {
          alert('Barbería creada exitosamente');
          this.cargarBarberias();
          this.toggleFormulario();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al crear barbería:', error);
          alert('Error al crear la barbería');
          this.cargando = false;
        }
      });
    }
  }

  editarBarberia(barberia: any): void {
    this.editandoId = barberia.idBarberia;
    this.formulario.patchValue(barberia);
    this.mostrarFormulario = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.formulario.reset({ aceptaReservasOnline: true });
    this.mostrarFormulario = false;
  }

  cambiarEstado(idBarberia: number, estadoActual: string): void {
    const nuevoEstado = estadoActual === 'ACTIVA' ? 'INACTIVA' : 'ACTIVA';
    const confirmar = confirm(`¿Cambiar estado a ${nuevoEstado}?`);
    
    if (!confirmar) return;

    this.cargando = true;
    this.barberiaService.cambiarEstadoBarberia(idBarberia, nuevoEstado).subscribe({
      next: () => {
        alert(`Estado cambiado a ${nuevoEstado}`);
        this.cargarBarberias();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cambiar estado:', error);
        alert('Error al cambiar el estado');
        this.cargando = false;
      }
    });
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'ACTIVA':
        return 'bg-success';
      case 'INACTIVA':
        return 'bg-warning text-dark';
      case 'SUSPENDIDA':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  get campoNombre() {
    return this.formulario.get('nombre');
  }

  get campoRuc() {
    return this.formulario.get('ruc');
  }

  get campoDireccion() {
    return this.formulario.get('direccion');
  }

  get campoCiudad() {
    return this.formulario.get('ciudad');
  }

  get campoTelefono() {
    return this.formulario.get('telefono');
  }

  get campoEmail() {
    return this.formulario.get('email');
  }
}
