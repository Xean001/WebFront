import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BarberiaService } from '../../../shared/services/barberias.service';
import { ServiciosService } from '../../../shared/services/servicios.service';
import { PersonalService } from '../../../shared/services/personal.service';
import { FavoritosService } from '../../../shared/services/favoritos.service';
import { ValoracionesService } from '../../../shared/services/valoraciones.service';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-detalle-barberia',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetalleBarberiasComponent implements OnInit {
  barberia: any = null;
  servicios: any[] = [];
  barberos: any[] = [];
  valoraciones: any[] = [];
  cargando: boolean = false;
  idBarberia: number = 0;
  esFavorito: boolean = false;
  cargandoFavorito: boolean = false;
  esUsuarioAutenticado: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private barberiaService: BarberiaService,
    private serviciosService: ServiciosService,
    private personalService: PersonalService,
    private favoritosService: FavoritosService,
    private valoracionesService: ValoracionesService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.esUsuarioAutenticado = this.authService.isAuthenticated();
    this.route.params.subscribe(params => {
      this.idBarberia = params['id'];
      this.cargarDetalles();
      if (this.esUsuarioAutenticado) {
        this.verificarFavorito();
      }
    });
  }

  cargarDetalles(): void {
    this.cargando = true;
    this.barberiaService.obtenerBarberiaPorId(this.idBarberia).subscribe({
      next: (response) => {
        if (response.success) {
          this.barberia = response.data;
          this.cargarServicios();
          this.cargarBarberos();
          this.cargarValoraciones();
        }
      },
      error: (error) => {
        console.error('Error al cargar barbería:', error);
        this.cargando = false;
      }
    });
  }

  cargarServicios(): void {
    this.serviciosService.obtenerPorBarberia(this.idBarberia).subscribe({
      next: (response) => {
        if (response.success) {
          this.servicios = response.data || [];
        }
      },
      error: (error) => {
        console.error('Error al cargar servicios:', error);
      }
    });
  }

  cargarBarberos(): void {
    this.personalService.obtenerBarberosPorBarberia(this.idBarberia).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.barberos = response.data.filter((b: any) => b.activo);
          console.log('Barberos cargados:', this.barberos);
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar barberos:', error);
        this.cargando = false;
      }
    });
  }

  irAReservar(): void {
    this.router.navigate(['/appointments/create'], { queryParams: { barberia: this.idBarberia } });
  }

  verificarFavorito(): void {
    this.favoritosService.esFavorito(this.idBarberia).subscribe({
      next: (response) => {
        console.log('Respuesta verificar favorito:', response);
        if (response.success) {
          this.esFavorito = response.data || false;
          console.log('Estado favorito actualizado:', this.esFavorito);
        }
      },
      error: (error) => {
        console.error('Error al verificar favorito:', error);
        this.esFavorito = false;
      }
    });
  }

  toggleFavorito(): void {
    if (!this.esUsuarioAutenticado) {
      alert('Debes iniciar sesión para agregar favoritos');
      this.router.navigate(['/auth/login']);
      return;
    }

    console.log('Toggle favorito - Estado actual:', this.esFavorito);
    console.log('ID Barbería:', this.idBarberia);
    this.cargandoFavorito = true;
    
    if (this.esFavorito) {
      this.favoritosService.eliminarFavorito(this.idBarberia).subscribe({
        next: (response) => {
          console.log('Respuesta eliminar favorito:', response);
          if (response.success) {
            this.esFavorito = false;
            alert('Barbería eliminada de favoritos');
            // Verificar estado actualizado
            this.verificarFavorito();
          }
          this.cargandoFavorito = false;
        },
        error: (error) => {
          console.error('Error completo al eliminar favorito:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.error);
          alert('Error al eliminar de favoritos: ' + (error.error?.message || error.message));
          this.cargandoFavorito = false;
        }
      });
    } else {
      this.favoritosService.agregarFavorito(this.idBarberia).subscribe({
        next: (response) => {
          console.log('Respuesta agregar favorito:', response);
          if (response.success) {
            this.esFavorito = true;
            alert('Barbería agregada a favoritos');
            // Verificar estado actualizado
            this.verificarFavorito();
          }
          this.cargandoFavorito = false;
        },
        error: (error) => {
          console.error('Error completo al agregar favorito:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.error);
          alert('Error al agregar a favoritos: ' + (error.error?.message || error.message));
          this.cargandoFavorito = false;
        }
      });
    }
  }

  cargarValoraciones(): void {
    this.valoracionesService.obtenerValoracionesBarberia(this.idBarberia).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.valoraciones = response.data;
        }
      },
      error: (error) => {
        console.error('Error al cargar valoraciones:', error);
      }
    });
  }

  obtenerUrlImagen(): string {
    const baseUrl = 'https://api.fadely.me';
    
    // Si tiene foto de portada
    if (this.barberia?.fotoPortadaUrl) {
      // Si es una URL completa, devolverla tal cual
      if (this.barberia.fotoPortadaUrl.startsWith('http')) {
        return this.barberia.fotoPortadaUrl;
      }
      // Si es una URL relativa del backend, agregar base URL
      if (this.barberia.fotoPortadaUrl.startsWith('/api/')) {
        return baseUrl + this.barberia.fotoPortadaUrl;
      }
    }
    
    // Si tiene logo
    if (this.barberia?.logoUrl) {
      if (this.barberia.logoUrl.startsWith('http')) {
        return this.barberia.logoUrl;
      }
      if (this.barberia.logoUrl.startsWith('/api/')) {
        return baseUrl + this.barberia.logoUrl;
      }
    }
    
    // Si tiene urlImagen (datos de ejemplo)
    if (this.barberia?.urlImagen) {
      return this.barberia.urlImagen;
    }
    
    // Imagen por defecto
    return 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400';
  }

  onImageError(event: any): void {
    // Si la imagen falla al cargar, usar imagen por defecto
    event.target.src = 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400';
  }
}
