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
  modoEdicion: boolean = false;
  imagenPortadaPreview: string | null = null;
  imagenLogoPreview: string | null = null;
  esPropietario: boolean = false;

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
        this.verificarPropietario();
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
    
    if (this.barberia?.fotoPortadaUrl) {
      if (this.barberia.fotoPortadaUrl.startsWith('http')) {
        return this.barberia.fotoPortadaUrl;
      }
      if (this.barberia.fotoPortadaUrl.startsWith('/api/')) {
        return baseUrl + this.barberia.fotoPortadaUrl;
      }
    }
    
    if (this.barberia?.logoUrl) {
      if (this.barberia.logoUrl.startsWith('http')) {
        return this.barberia.logoUrl;
      }
      if (this.barberia.logoUrl.startsWith('/api/')) {
        return baseUrl + this.barberia.logoUrl;
      }
    }
    
    if (this.barberia?.urlImagen) {
      return this.barberia.urlImagen;
    }
    
    return 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400';
  }

  onImageError(event: any): void {
    // Si la imagen falla al cargar, usar imagen por defecto
    event.target.src = 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400';
  }

  verificarPropietario(): void {
    this.barberiaService.obtenerBarberiasPropias().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.esPropietario = response.data.some((b: any) => b.idBarberia === Number(this.idBarberia));
          console.log('Es propietario:', this.esPropietario);
        }
      },
      error: (error) => {
        console.error('Error al verificar propietario:', error);
      }
    });
  }

  activarModoEdicion(): void {
    this.modoEdicion = true;
    this.imagenPortadaPreview = null;
    this.imagenLogoPreview = null;
  }

  cancelarEdicion(): void {
    this.modoEdicion = false;
    this.imagenPortadaPreview = null;
    this.imagenLogoPreview = null;
  }

  onFilePortadaSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagenPortadaPreview = e.target.result;
        console.log('✅ Nueva imagen de portada seleccionada, preview actualizado');
      };
      reader.readAsDataURL(file);
    }
  }

  onFileLogoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagenLogoPreview = e.target.result;
        console.log('✅ Nueva imagen de logo seleccionada, preview actualizado');
      };
      reader.readAsDataURL(file);
    }
  }

  eliminarImagenPortada(): void {
    this.imagenPortadaPreview = null;
    const fileInput = document.getElementById('imagenPortadaInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  eliminarImagenLogo(): void {
    this.imagenLogoPreview = null;
    const fileInput = document.getElementById('imagenLogoInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  guardarImagenes(): void {
    if (!this.imagenPortadaPreview && !this.imagenLogoPreview) {
      alert('Debes seleccionar al menos una imagen para actualizar');
      return;
    }

    const datos: any = {
      idBarberia: this.idBarberia
    };

    if (this.imagenPortadaPreview && this.imagenPortadaPreview.startsWith('data:image/')) {
      datos.fotoPortadaUrl = this.imagenPortadaPreview;
    }

    if (this.imagenLogoPreview && this.imagenLogoPreview.startsWith('data:image/')) {
      datos.logoUrl = this.imagenLogoPreview;
    }

    this.barberiaService.actualizarBarberia(this.idBarberia, datos).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Imágenes actualizadas exitosamente');
          this.modoEdicion = false;
          this.imagenPortadaPreview = null;
          this.imagenLogoPreview = null;
          this.cargarDetalles();
        }
      },
      error: (error) => {
        console.error('Error al actualizar imágenes:', error);
        alert('Error al actualizar las imágenes');
      }
    });
  }

  obtenerUrlLogo(): string {
    const baseUrl = 'https://api.fadely.me';
    
    if (this.barberia?.logoUrl) {
      if (this.barberia.logoUrl.startsWith('http')) {
        return this.barberia.logoUrl;
      }
      if (this.barberia.logoUrl.startsWith('/api/')) {
        return baseUrl + this.barberia.logoUrl;
      }
    }
    
    return 'https://via.placeholder.com/150?text=Logo';
  }
}
