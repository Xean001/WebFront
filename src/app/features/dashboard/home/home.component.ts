import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, AuthResponse } from '../../../shared/services/auth.service';
import { ServiciosService } from '../../../shared/services/servicios.service';
import { BarberiaService, BarberiaDTO } from '../../../shared/services/barberias.service';
import { PersonalService } from '../../../shared/services/personal.service';
import { Observable } from 'rxjs';

interface Barberia {
  id: number;
  nombre: string;
  direccion: string;
  imagen: string;
  calificacion: number;
  totalResenas: number;
  servicios: string[];
  precioDesde: number;
}

interface Barbero {
  id: number;
  nombre: string;
  especialidad: string;
  barberia: string;
  imagen: string;
  calificacion: number;
  totalCortes: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  currentUser$: Observable<AuthResponse | null>;
  currentUser: AuthResponse | null = null;
  isAuthenticated: boolean = false;
  serviciosPopulares: any[] = [];
  cargandoServicios: boolean = false;
  barberias: any[] = [];
  barberoDestacados: any[] = [];
  cargandoBarberias: boolean = false;
  cargandoBarberos: boolean = false;

  constructor(
    public authService: AuthService,
    private serviciosService: ServiciosService,
    private barberíasService: BarberiaService,
    private personalService: PersonalService
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    // Suscribirse al observable de usuario actual
    this.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAuthenticated = !!user;
    });
    
    // Cargar datos
    this.cargarServiciosPopulares();
    this.cargarBarberias();
    this.cargarBarberos();
  }
  
  cargarBarberias(): void {
    this.cargandoBarberias = true;
    this.barberíasService.obtenerBarberiasActivas().subscribe({
      next: (response: any) => {
        if (response.success && response.data && response.data.length > 0) {
          this.barberias = response.data.map((barberia: BarberiaDTO) => ({
            id: barberia.idBarberia,
            nombre: barberia.nombre,
            direccion: barberia.direccion + (barberia.ciudad ? ', ' + barberia.ciudad : ''),
            imagen: this.obtenerUrlImagenBarberia(barberia.fotoPortadaUrl),
            calificacion: 4.5, // Por ahora fijo, luego desde backend
            totalResenas: 0,
            servicios: [],
            precioDesde: 15
          }));
        }
        this.cargandoBarberias = false;
      },
      error: (error: any) => {
        this.barberias = [];
        this.cargandoBarberias = false;
      }
    });
  }

  cargarBarberos(): void {
    this.cargandoBarberos = true;
    this.personalService.obtenerTodosBarberos().subscribe({
      next: (response: any) => {
        if (response.success && response.data && response.data.length > 0) {
          // Limitar a los primeros 4 barberos
          this.barberoDestacados = response.data.slice(0, 4).map((barbero: any) => ({
            id: barbero.idPerfil,
            nombre: barbero.usuario?.nombre || 'Barbero',
            especialidad: barbero.especialidad || 'Especialista',
            barberia: '', // Se puede cargar después
            imagen: this.obtenerUrlImagenBarbero(barbero.fotoPerfilUrl),
            calificacion: barbero.calificacionPromedio || 4.5,
            totalCortes: 0
          }));
        }
        this.cargandoBarberos = false;
      },
      error: (error: any) => {
        this.barberoDestacados = [];
        this.cargandoBarberos = false;
      }
    });
  }

  cargarServiciosPopulares(): void {
    this.cargandoServicios = true;
    this.serviciosService.obtenerServiciosMasPopulares().subscribe({
      next: (response: any) => {
        if (response.success && response.data && response.data.length > 0) {
          this.serviciosPopulares = response.data.map((servicio: any) => {
            return {
              nombre: servicio.nombre,
              descripcion: servicio.descripcion,
              imagen: this.obtenerUrlImagen(servicio.fotoUrl),
              precio: `S/ ${servicio.precio}`,
              totalReservas: servicio.totalReservas || 0
            };
          });
        } else {
          // Fallback a servicios estáticos si no hay datos
          this.usarServiciosEstaticos();
        }
        this.cargandoServicios = false;
      },
      error: (error: any) => {
        // Usar servicios estáticos como fallback
        this.usarServiciosEstaticos();
        this.cargandoServicios = false;
      }
    });
  }

  usarServiciosEstaticos(): void {
    this.serviciosPopulares = [
      { 
        nombre: 'Corte Clásico', 
        descripcion: 'Estilo atemporal y profesional',
        imagen: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=300&fit=crop',
        precio: 'S/ 85',
        totalReservas: 0
      },
      { 
        nombre: 'Barba Profesional', 
        descripcion: 'Perfilado y cuidado experto',
        imagen: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=300&fit=crop',
        precio: 'S/ 51',
        totalReservas: 0
      },
      { 
        nombre: 'Afeitado Clásico', 
        descripcion: 'Afeitado tradicional con navaja',
        imagen: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop',
        precio: 'S/ 68',
        totalReservas: 0
      },
      { 
        nombre: 'Tinte Profesional', 
        descripcion: 'Color vibrante y duradero',
        imagen: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&h=300&fit=crop',
        precio: 'S/ 136',
        totalReservas: 0
      },
      { 
        nombre: 'Peinado Moderno', 
        descripcion: 'Estilos contemporáneos',
        imagen: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400&h=300&fit=crop',
        precio: 'S/ 102',
        totalReservas: 0
      },
      { 
        nombre: 'Tratamiento Capilar', 
        descripcion: 'Hidratación y recuperación',
        imagen: 'https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?w=400&h=300&fit=crop',
        precio: 'S/ 119',
        totalReservas: 0
      },
      { 
        nombre: 'Corte Fade', 
        descripcion: 'Degradado perfecto',
        imagen: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&h=300&fit=crop',
        precio: 'S/ 95',
        totalReservas: 0
      },
      { 
        nombre: 'Diseño de Cejas', 
        descripcion: 'Perfilado profesional',
        imagen: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=300&fit=crop',
        precio: 'S/ 41',
        totalReservas: 0
      }
    ];
  }

  currentSlide = 0;
  
  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.serviciosPopulares.length;
  }
  
  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.serviciosPopulares.length) % this.serviciosPopulares.length;
  }
  
  goToSlide(index: number) {
    this.currentSlide = index;
  }
  
  getVisibleServices() {
    const services = [...this.serviciosPopulares];
    const visible = [];
    
    // En pantallas grandes mostramos 3 servicios
    for (let i = 0; i < 3; i++) {
      visible.push(services[(this.currentSlide + i) % services.length]);
    }
    
    return visible;
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.floor(rating) ? 1 : 0);
  }

  obtenerUrlImagen(fotoUrl: string | null | undefined): string {
    const baseUrl = 'https://api.fadely.me';
    const defaultImage = 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop';
    
    if (!fotoUrl) return defaultImage;
    if (fotoUrl.startsWith('http')) return fotoUrl;
    if (fotoUrl.startsWith('data:')) return fotoUrl;
    if (fotoUrl.startsWith('/api/')) return baseUrl + fotoUrl;
    
    return defaultImage;
  }

  obtenerUrlImagenBarberia(fotoUrl: string | null | undefined): string {
    const baseUrl = 'https://api.fadely.me';
    const defaultImage = 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400';
    
    if (!fotoUrl) return defaultImage;
    if (fotoUrl.startsWith('http')) return fotoUrl;
    if (fotoUrl.startsWith('data:')) return fotoUrl;
    if (fotoUrl.startsWith('/api/')) return baseUrl + fotoUrl;
    
    return defaultImage;
  }

  obtenerUrlImagenBarbero(fotoUrl: string | null | undefined): string {
    const baseUrl = 'https://api.fadely.me';
    const defaultImage = 'https://i.pravatar.cc/300';
    
    if (!fotoUrl) return defaultImage;
    if (fotoUrl.startsWith('http')) return fotoUrl;
    if (fotoUrl.startsWith('data:')) return fotoUrl;
    if (fotoUrl.startsWith('/api/')) return baseUrl + fotoUrl;
    
    return defaultImage;
  }

  onImageError(event: any): void {
    event.target.src = 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop';
  }
}
