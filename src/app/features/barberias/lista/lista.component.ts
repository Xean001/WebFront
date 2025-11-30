import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BarberiaService } from '../../../shared/services/barberias.service';

@Component({
  selector: 'app-lista-barberias',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.css']
})
export class ListaBarberiasComponent implements OnInit {
  barberias: any[] = [];
  barberiasOriginales: any[] = [];
  ciudades: string[] = [];
  busqueda: string = '';
  ciudadSeleccionada: string = '';
  cargando: boolean = false;
  paginaActual: number = 0;
  totalPaginas: number = 1;
  tamanioPagina: number = 10;
  conErrorAPI: boolean = false;

  // Datos de muestra en caso de que la API no funcione
  barberiasEjemplo = [
    {
      idBarberia: 1,
      nombre: 'Barbería Los Patrones',
      ciudad: 'Lima',
      direccion: 'Av. Central 123, Centro',
      urlImagen: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400',
      calificacion: 4.8,
      telefono: '555-0101',
      aceptaReservasOnline: true,
      puntuacion: 4.8,
      horarioApertura: '09:00',
      horarioCierre: '19:00',
      estado: 'Abierto'
    },
    {
      idBarberia: 2,
      nombre: 'Elite Barber Shop',
      ciudad: 'Lima',
      direccion: 'Calle Los Olivos 456',
      urlImagen: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400',
      calificacion: 4.9,
      telefono: '555-0102',
      aceptaReservasOnline: true,
      puntuacion: 4.9,
      horarioApertura: '08:30',
      horarioCierre: '20:00',
      estado: 'Abierto'
    },
    {
      idBarberia: 3,
      nombre: 'Classic Style Barber',
      ciudad: 'Arequipa',
      direccion: 'Jr. Independencia 789',
      urlImagen: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400',
      calificacion: 4.7,
      telefono: '555-0103',
      aceptaReservasOnline: false,
      puntuacion: 4.7,
      horarioApertura: '09:30',
      horarioCierre: '18:30',
      estado: 'Abierto'
    },
    {
      idBarberia: 4,
      nombre: 'Urban Cuts Studio',
      ciudad: 'Lima',
      direccion: 'Av. Principal 321',
      urlImagen: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400',
      calificacion: 4.9,
      telefono: '555-0104',
      aceptaReservasOnline: true,
      puntuacion: 4.9,
      horarioApertura: '10:00',
      horarioCierre: '21:00',
      estado: 'Abierto'
    },
    {
      idBarberia: 5,
      nombre: 'Gentleman\'s Cut',
      ciudad: 'Cusco',
      direccion: 'Calle Real 567',
      urlImagen: 'https://images.unsplash.com/photo-1622296089863-eb7fc530daa8?w=400',
      calificacion: 4.8,
      telefono: '555-0105',
      aceptaReservasOnline: true,
      puntuacion: 4.8,
      horarioApertura: '09:00',
      horarioCierre: '19:30',
      estado: 'Abierto'
    },
    {
      idBarberia: 6,
      nombre: 'Fresh Cuts Barber',
      ciudad: 'Lima',
      direccion: 'Av. Los Pinos 890',
      urlImagen: 'https://images.unsplash.com/photo-1620331311520-246422fd82f9?w=400',
      calificacion: 4.6,
      telefono: '555-0106',
      aceptaReservasOnline: true,
      puntuacion: 4.6,
      horarioApertura: '09:00',
      horarioCierre: '19:00',
      estado: 'Abierto'
    }
  ];

  constructor(
    private barberiaService: BarberiaService,
    private router: Router
  ) { }

  ngOnInit(): void {
    try {
      this.cargarBarberias();
      this.cargarCiudades();
    } catch (error) {
      console.error('Error en ngOnInit:', error);
      // Fallback completo: usar datos de ejemplo
      this.barberias = this.barberiasEjemplo;
      this.barberiasOriginales = [...this.barberias];
      this.ciudades = [...new Set(this.barberiasEjemplo.map(b => b.ciudad))];
      this.conErrorAPI = true;
      this.cargando = false;
    }
  }

  cargarCiudades(): void {
    try {
      this.barberiaService.obtenerCiudades().subscribe({
        next: (response) => {
          if (response && response.success) {
            this.ciudades = response.data || [];
          } else {
            // Fallback si la respuesta no es exitosa
            this.ciudades = [...new Set(this.barberiasEjemplo.map(b => b.ciudad))];
          }
        },
        error: (error) => {
          console.warn('No se pudieron cargar ciudades desde API, usando ejemplos', error);
          // Extraer ciudades de los datos de ejemplo
          this.ciudades = [...new Set(this.barberiasEjemplo.map(b => b.ciudad))];
        }
      });
    } catch (error) {
      console.error('Error en cargarCiudades:', error);
      this.ciudades = [...new Set(this.barberiasEjemplo.map(b => b.ciudad))];
    }
  }

  cargarBarberias(): void {
    try {
      this.cargando = true;
      this.barberiaService.obtenerBarberiasActivasPaginadas(this.paginaActual, this.tamanioPagina)
        .subscribe({
          next: (response) => {
            try {
              if (response && response.success && response.data) {
                this.barberias = response.data.content || [];
                this.barberiasOriginales = [...this.barberias];
                this.totalPaginas = response.data.totalPages || 1;
                this.conErrorAPI = false;
              } else {
                // Respuesta no válida, usar ejemplos
                throw new Error('Respuesta inválida de la API');
              }
            } catch (error) {
              console.warn('Error procesando respuesta de API:', error);
              this.barberias = this.barberiasEjemplo;
              this.barberiasOriginales = [...this.barberias];
              this.totalPaginas = 1;
              this.conErrorAPI = true;
            }
            this.cargando = false;
          },
          error: (error) => {
            console.warn('Error al cargar barberías desde API, usando datos de ejemplo:', error);
            // Usar datos de ejemplo cuando la API falla
            this.barberias = this.barberiasEjemplo;
            this.barberiasOriginales = [...this.barberias];
            this.totalPaginas = 1;
            this.conErrorAPI = true;
            this.cargando = false;
          }
        });
    } catch (error) {
      console.error('Error fatal en cargarBarberias:', error);
      this.barberias = this.barberiasEjemplo;
      this.barberiasOriginales = [...this.barberias];
      this.totalPaginas = 1;
      this.conErrorAPI = true;
      this.cargando = false;
    }
  }

  buscarBarberias(): void {
    if (!this.busqueda.trim()) {
      this.barberias = [...this.barberiasOriginales];
      this.paginaActual = 0;
      return;
    }

    this.cargando = true;
    this.paginaActual = 0;

    if (this.conErrorAPI) {
      // Búsqueda local en datos de ejemplo
      const query = this.busqueda.toLowerCase();
      this.barberias = this.barberiasOriginales.filter(b =>
        b.nombre.toLowerCase().includes(query) ||
        b.ciudad.toLowerCase().includes(query) ||
        b.direccion.toLowerCase().includes(query)
      );
      this.cargando = false;
    } else {
      // Búsqueda en API
      this.barberiaService.buscarBarberiasPaginadas(this.busqueda, this.paginaActual, this.tamanioPagina)
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.barberias = response.data.content || [];
              this.totalPaginas = response.data.totalPages || 1;
            }
            this.cargando = false;
          },
          error: (error) => {
            console.warn('Error en búsqueda de API, buscando en datos locales:', error);
            // Fallback a búsqueda local
            const query = this.busqueda.toLowerCase();
            this.barberias = this.barberiasOriginales.filter(b =>
              b.nombre.toLowerCase().includes(query) ||
              b.ciudad.toLowerCase().includes(query) ||
              b.direccion.toLowerCase().includes(query)
            );
            this.cargando = false;
          }
        });
    }
  }

  filtrarPorCiudad(): void {
    this.paginaActual = 0;
    if (!this.ciudadSeleccionada) {
      this.barberias = [...this.barberiasOriginales];
      return;
    }

    this.cargando = true;

    if (this.conErrorAPI) {
      // Filtrado local
      this.barberias = this.barberiasOriginales.filter(b => b.ciudad === this.ciudadSeleccionada);
      this.cargando = false;
    } else {
      // Filtrado en API
      this.barberiaService.obtenerPorCiudad(this.ciudadSeleccionada)
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.barberias = response.data || [];
              this.totalPaginas = 1;
            }
            this.cargando = false;
          },
          error: (error) => {
            console.warn('Error en filtrado de API, filtrando datos locales:', error);
            // Fallback a filtrado local
            this.barberias = this.barberiasOriginales.filter(b => b.ciudad === this.ciudadSeleccionada);
            this.cargando = false;
          }
        });
    }
  }

  irAPagina(pagina: number): void {
    if (pagina >= 0 && pagina < this.totalPaginas) {
      this.paginaActual = pagina;
      this.cargarBarberias();
    }
  }

  verDetalle(idBarberia: number): void {
    this.router.navigate(['/barberias/detail', idBarberia]);
  }
}
