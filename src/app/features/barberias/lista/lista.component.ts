import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BarberiaService } from '../../../shared/services/barberias.service';
import { FavoritosService } from '../../../shared/services/favoritos.service';
import { AuthService } from '../../../shared/services/auth.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

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
  favoritos: Set<number> = new Set<number>();
  esUsuarioAutenticado: boolean = false;
  cargandoFavorito: { [key: number]: boolean } = {};

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
    private favoritosService: FavoritosService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.esUsuarioAutenticado = this.authService.isAuthenticated();
    try {
      this.cargarBarberias();
      this.cargarCiudades();
      if (this.esUsuarioAutenticado) {
        this.cargarFavoritos();
      }
    } catch (error) {
      console.error('Error en ngOnInit:', error);
      // Fallback completo: usar datos de ejemplo
      this.barberiasOriginales = [...this.barberiasEjemplo];
      this.totalPaginas = Math.ceil(this.barberiasOriginales.length / this.tamanioPagina);
      this.aplicarPaginacion();
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
      // Usar endpoint público sin autenticación
      this.barberiaService.obtenerBarberiasActivas()
        .subscribe({
          next: (response) => {
            try {
              if (response && response.success && response.data) {
                // Guardar todas las barberías
                this.barberiasOriginales = response.data || [];
                
                // Calcular paginación manualmente en el cliente
                this.totalPaginas = Math.ceil(this.barberiasOriginales.length / this.tamanioPagina);
                
                // Obtener página actual
                this.aplicarPaginacion();
                this.conErrorAPI = false;
              } else {
                // Respuesta no válida, usar ejemplos
                throw new Error('Respuesta inválida de la API');
              }
            } catch (error) {
              console.warn('Error procesando respuesta de API:', error);
              this.barberiasOriginales = this.barberiasEjemplo;
              this.totalPaginas = Math.ceil(this.barberiasOriginales.length / this.tamanioPagina);
              this.aplicarPaginacion();
              this.conErrorAPI = true;
            }
            this.cargando = false;
          },
          error: (error) => {
            console.warn('Error al cargar barberías desde API, usando datos de ejemplo:', error);
            // Usar datos de ejemplo cuando la API falla
            this.barberiasOriginales = this.barberiasEjemplo;
            this.totalPaginas = Math.ceil(this.barberiasOriginales.length / this.tamanioPagina);
            this.aplicarPaginacion();
            this.conErrorAPI = true;
            this.cargando = false;
          }
        });
    } catch (error) {
      console.error('Error fatal en cargarBarberias:', error);
      this.barberiasOriginales = this.barberiasEjemplo;
      this.totalPaginas = Math.ceil(this.barberiasOriginales.length / this.tamanioPagina);
      this.aplicarPaginacion();
      this.conErrorAPI = true;
      this.cargando = false;
    }
  }

  /**
   * Aplicar paginación manualmente (lado cliente)
   */
  aplicarPaginacion(): void {
    const inicio = this.paginaActual * this.tamanioPagina;
    const fin = inicio + this.tamanioPagina;
    this.barberias = this.barberiasOriginales.slice(inicio, fin);
  }

  buscarBarberias(): void {
    this.paginaActual = 0;
    
    if (!this.busqueda.trim()) {
      // Si no hay búsqueda, mostrar todos los datos
      this.totalPaginas = Math.ceil(this.barberiasOriginales.length / this.tamanioPagina);
      this.aplicarPaginacion();
      return;
    }

    // Búsqueda local en datos originales SIN modificarlos
    const query = this.busqueda.toLowerCase();
    const resultados = this.barberiasOriginales.filter(b =>
      b.nombre.toLowerCase().includes(query) ||
      b.ciudad.toLowerCase().includes(query) ||
      b.direccion.toLowerCase().includes(query)
    );

    // Mostrar resultados de búsqueda
    this.barberias = resultados;
    this.totalPaginas = resultados.length > 0 ? Math.ceil(resultados.length / this.tamanioPagina) : 1;
  }

  filtrarPorCiudad(): void {
    this.paginaActual = 0;
    
    if (!this.ciudadSeleccionada) {
      // Resetear a todos los datos originales (o búsqueda actual si hay)
      if (this.busqueda.trim()) {
        this.buscarBarberias();
      } else {
        this.totalPaginas = Math.ceil(this.barberiasOriginales.length / this.tamanioPagina);
        this.aplicarPaginacion();
      }
      return;
    }

    // Filtrado local de datos originales
    const resultados = this.barberiasOriginales.filter(b => b.ciudad === this.ciudadSeleccionada);
    
    // Si hay búsqueda activa, aplicar también el filtro de búsqueda
    let resultadosFinales = resultados;
    if (this.busqueda.trim()) {
      const query = this.busqueda.toLowerCase();
      resultadosFinales = resultados.filter(b =>
        b.nombre.toLowerCase().includes(query) ||
        b.ciudad.toLowerCase().includes(query) ||
        b.direccion.toLowerCase().includes(query)
      );
    }

    // Actualizar lista mostrada
    this.barberias = resultadosFinales;
    this.totalPaginas = resultadosFinales.length > 0 ? Math.ceil(resultadosFinales.length / this.tamanioPagina) : 1;
  }

  irAPagina(pagina: number): void {
    if (pagina >= 0 && pagina < this.totalPaginas) {
      this.paginaActual = pagina;
      this.aplicarPaginacion();
    }
  }

  verDetalle(idBarberia: number): void {
    this.router.navigate(['/barberias/detail', idBarberia]);
  }

  cargarFavoritos(): void {
    this.favoritosService.obtenerMisFavoritos().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.favoritos = new Set(response.data.map((b: any) => b.idBarberia));
          console.log('Favoritos cargados:', this.favoritos);
          // Reordenar barberías después de cargar favoritos
          this.ordenarPorFavoritos();
        }
      },
      error: (error) => {
        console.error('Error al cargar favoritos:', error);
      }
    });
  }

  esFavorito(idBarberia: number): boolean {
    return this.favoritos.has(idBarberia);
  }

  toggleFavorito(event: Event, idBarberia: number): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.esUsuarioAutenticado) {
      alert('Debes iniciar sesión para agregar favoritos');
      this.router.navigate(['/auth/login']);
      return;
    }

    this.cargandoFavorito[idBarberia] = true;

    if (this.esFavorito(idBarberia)) {
      this.favoritosService.eliminarFavorito(idBarberia).subscribe({
        next: (response) => {
          if (response.success) {
            this.favoritos.delete(idBarberia);
            this.ordenarPorFavoritos();
          }
          this.cargandoFavorito[idBarberia] = false;
        },
        error: (error) => {
          console.error('Error al eliminar favorito:', error);
          this.cargandoFavorito[idBarberia] = false;
        }
      });
    } else {
      this.favoritosService.agregarFavorito(idBarberia).subscribe({
        next: (response) => {
          if (response.success) {
            this.favoritos.add(idBarberia);
            this.ordenarPorFavoritos();
          }
          this.cargandoFavorito[idBarberia] = false;
        },
        error: (error) => {
          console.error('Error al agregar favorito:', error);
          this.cargandoFavorito[idBarberia] = false;
        }
      });
    }
  }

  ordenarPorFavoritos(): void {
    // Ordenar barberías: favoritos primero
    this.barberiasOriginales.sort((a, b) => {
      const aEsFav = this.esFavorito(a.idBarberia) ? 1 : 0;
      const bEsFav = this.esFavorito(b.idBarberia) ? 1 : 0;
      return bEsFav - aEsFav; // Favoritos primero
    });
    
    // Recalcular paginación
    this.totalPaginas = Math.ceil(this.barberiasOriginales.length / this.tamanioPagina);
    this.aplicarPaginacion();
  }

  obtenerUrlImagen(barberia: any): string {
    const baseUrl = 'https://api.fadely.me';
    
    // Si tiene foto de portada
    if (barberia.fotoPortadaUrl) {
      // Si es una URL completa, devolverla tal cual
      if (barberia.fotoPortadaUrl.startsWith('http')) {
        return barberia.fotoPortadaUrl;
      }
      // Si es una URL relativa del backend, agregar base URL
      if (barberia.fotoPortadaUrl.startsWith('/api/')) {
        return baseUrl + barberia.fotoPortadaUrl;
      }
    }
    
    // Si tiene logo
    if (barberia.logoUrl) {
      if (barberia.logoUrl.startsWith('http')) {
        return barberia.logoUrl;
      }
      if (barberia.logoUrl.startsWith('/api/')) {
        return baseUrl + barberia.logoUrl;
      }
    }
    
    // Si tiene urlImagen (datos de ejemplo)
    if (barberia.urlImagen) {
      return barberia.urlImagen;
    }
    
    // Imagen por defecto
    return 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400';
  }

  onImageError(event: any): void {
    // Si la imagen falla al cargar, usar imagen por defecto
    event.target.src = 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400';
  }
}
