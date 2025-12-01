import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ServiciosService, Servicio } from '../../../shared/services/servicios.service';
import { BarberiaService } from '../../../shared/services/barberias.service';

@Component({
  selector: 'app-administrar-servicios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './administrar.component.html',
  styleUrl: './administrar.component.css'
})
export class AdministrarServiciosComponent implements OnInit {
  barberias: any[] = [];
  servicios: any[] = [];
  serviciosFiltrados: any[] = [];
  formulario: FormGroup;
  editandoId: number | null = null;
  cargando: boolean = false;
  mostrarFormulario: boolean = false;
  barberiaSeleccionada: number | null = null;
  busqueda: string = '';
  filtroCategoria: string = '';
  categorias: string[] = [];

  constructor(
    private serviciosService: ServiciosService,
    private barberiaService: BarberiaService,
    private fb: FormBuilder
  ) {
    this.formulario = this.crearFormulario();
  }

  ngOnInit(): void {
    this.cargarBarberias();
    this.cargarCategorias();
  }

  crearFormulario(): FormGroup {
    return this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', Validators.maxLength(500)],
      precio: ['', [Validators.required, Validators.min(0)]],
      duracion: ['', [Validators.required, Validators.min(1)]],
      categoria: ['', Validators.required],
      serviciosIncluidos: [''],  // Campo opcional para servicios incluidos separados por comas
      destacado: [false],
      activo: [true]
    });
  }

  cargarBarberias(): void {
    this.cargando = true;
    this.barberiaService.obtenerBarberiasPropias().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.barberias = response.data || [];
          // Si no tiene barberías, mostrar mensaje
          if (this.barberias.length === 0) {
            alert('Debes crear una barbería primero antes de agregar servicios.');
          }
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar barberías:', error);
        this.cargando = false;
      }
    });
  }

  cargarCategorias(): void {
    this.serviciosService.obtenerCategorias().subscribe({
      next: (response) => {
        if (response.success || response.data) {
          this.categorias = Array.isArray(response.data) ? response.data : response.data || [];
        }
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
      }
    });
  }

  onBarberiaChange(): void {
    if (!this.barberiaSeleccionada) {
      this.servicios = [];
      this.serviciosFiltrados = [];
      return;
    }
    this.cargarServicios();
  }

  cargarServicios(): void {
    if (!this.barberiaSeleccionada) return;

    this.cargando = true;
    this.serviciosService.obtenerPorBarberia(this.barberiaSeleccionada).subscribe({
      next: (response) => {
        if (response.success || response.data) {
          this.servicios = Array.isArray(response.data) ? response.data : response.data || [];
          this.aplicarFiltros();
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar servicios:', error);
        alert('Error al cargar servicios');
        this.cargando = false;
      }
    });
  }

  aplicarFiltros(): void {
    let resultado = this.servicios;

    if (this.busqueda.trim()) {
      const search = this.busqueda.toLowerCase();
      resultado = resultado.filter(s =>
        s.nombre.toLowerCase().includes(search) ||
        s.descripcion.toLowerCase().includes(search)
      );
    }

    if (this.filtroCategoria) {
      resultado = resultado.filter(s => s.categoria === this.filtroCategoria);
    }

    this.serviciosFiltrados = resultado;
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.editandoId = null;
      this.formulario.reset({ destacado: false, activo: true });
    }
  }

  guardarServicio(): void {
    if (!this.barberiaSeleccionada) {
      alert('Debes seleccionar una barbería primero');
      return;
    }

    if (this.barberias.length === 0) {
      alert('No tienes barberías. Debes crear una barbería antes de agregar servicios.');
      return;
    }

    if (this.formulario.invalid) {
      alert('Por favor completa todos los campos requeridos correctamente');
      return;
    }

    this.cargando = true;
    const datos = this.formulario.value;

    // Convertir serviciosIncluidos de string a JSON array válido
    let serviciosIncluidosJson = null;
    if (datos.serviciosIncluidos && datos.serviciosIncluidos.trim()) {
      // Separar por comas y crear array JSON válido
      const serviciosArray = datos.serviciosIncluidos
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);
      
      if (serviciosArray.length > 0) {
        serviciosIncluidosJson = JSON.stringify(serviciosArray);
      }
    }

    const servicio: Servicio = {
      idServicio: this.editandoId || 0,
      idBarberia: this.barberiaSeleccionada,
      nombre: datos.nombre,
      descripcion: datos.descripcion || '',
      precio: parseFloat(datos.precio),
      precioDesde: false,
      duracionMinutos: parseInt(datos.duracion),
      categoria: datos.categoria,
      serviciosIncluidos: serviciosIncluidosJson,
      fotoUrl: null,
      destacado: datos.destacado || false,
      activo: datos.activo !== undefined ? datos.activo : true
    };

    console.log('📤 Servicio a enviar:', JSON.stringify(servicio, null, 2));

    if (this.editandoId) {
      // Actualizar
      this.serviciosService.actualizarServicio(this.editandoId, servicio).subscribe({
        next: () => {
          alert('Servicio actualizado exitosamente');
          this.cargarServicios();
          this.toggleFormulario();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al actualizar servicio:', error);
          alert('Error al actualizar el servicio');
          this.cargando = false;
        }
      });
    } else {
      // Crear
      this.serviciosService.crearServicio(servicio).subscribe({
        next: () => {
          alert('Servicio creado exitosamente');
          this.cargarServicios();
          this.toggleFormulario();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al crear servicio:', error);
          alert('Error al crear el servicio');
          this.cargando = false;
        }
      });
    }
  }

  editarServicio(servicio: any): void {
    this.editandoId = servicio.idServicio;
    this.formulario.patchValue({
      nombre: servicio.nombre,
      descripcion: servicio.descripcion,
      precio: servicio.precio,
      duracion: servicio.duracionMinutos || servicio.duracion,
      categoria: servicio.categoria,
      destacado: servicio.destacado,
      activo: servicio.activo
    });
    this.mostrarFormulario = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.formulario.reset({ destacado: false, activo: true });
    this.mostrarFormulario = false;
  }

  eliminarServicio(idServicio: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
      this.cargando = true;
      this.serviciosService.eliminarServicio(idServicio).subscribe({
        next: () => {
          alert('Servicio eliminado exitosamente');
          this.cargarServicios();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al eliminar servicio:', error);
          alert('Error al eliminar el servicio');
          this.cargando = false;
        }
      });
    }
  }

  toggleDestacado(servicio: any): void {
    const servicioActualizado = { ...servicio, destacado: !servicio.destacado };
    this.cargando = true;
    this.serviciosService.actualizarServicio(servicio.idServicio, servicioActualizado).subscribe({
      next: () => {
        alert(servicio.destacado ? 'Servicio removido de destacados' : 'Servicio agregado a destacados');
        this.cargarServicios();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al actualizar destacado:', error);
        alert('Error al actualizar el servicio');
        this.cargando = false;
      }
    });
  }

  get campoNombre() {
    return this.formulario.get('nombre');
  }

  get campoPrecio() {
    return this.formulario.get('precio');
  }

  get campoDuracion() {
    return this.formulario.get('duracion');
  }

  get campoCategoria() {
    return this.formulario.get('categoria');
  }

  // Getter para String en el template
  String = String;
}
