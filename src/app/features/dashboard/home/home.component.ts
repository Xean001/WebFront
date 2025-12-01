import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, AuthResponse } from '../../../shared/services/auth.service';
import { ServiciosService } from '../../../shared/services/servicios.service';
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

  constructor(
    public authService: AuthService,
    private serviciosService: ServiciosService
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    // Suscribirse al observable de usuario actual
    this.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAuthenticated = !!user;
    });
    
    // Cargar servicios más populares
    this.cargarServiciosPopulares();
  }
  
  barberias: Barberia[] = [
    {
      id: 1,
      nombre: 'Barbería Los Patrones',
      direccion: 'Av. Central 123, Centro',
      imagen: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400',
      calificacion: 4.8,
      totalResenas: 156,
      servicios: ['Corte de cabello', 'Barba', 'Afeitado'],
      precioDesde: 85
    },
    {
      id: 2,
      nombre: 'Elite Barber Shop',
      direccion: 'Calle Los Olivos 456',
      imagen: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400',
      calificacion: 4.9,
      totalResenas: 203,
      servicios: ['Corte moderno', 'Barba premium', 'Color'],
      precioDesde: 102
    },
    {
      id: 3,
      nombre: 'Classic Style Barber',
      direccion: 'Jr. Independencia 789',
      imagen: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400',
      calificacion: 4.7,
      totalResenas: 98,
      servicios: ['Corte clásico', 'Barba tradicional', 'Afeitado navaja'],
      precioDesde: 68
    },
    {
      id: 4,
      nombre: 'Urban Cuts Studio',
      direccion: 'Av. Principal 321',
      imagen: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400',
      calificacion: 4.9,
      totalResenas: 187,
      servicios: ['Corte fade', 'Diseño', 'Perfilado'],
      precioDesde: 119
    },
    {
      id: 5,
      nombre: 'Gentleman\'s Cut',
      direccion: 'Calle Real 567',
      imagen: 'https://images.unsplash.com/photo-1622296089863-eb7fc530daa8?w=400',
      calificacion: 4.8,
      totalResenas: 142,
      servicios: ['Corte ejecutivo', 'Barba premium', 'Masaje'],
      precioDesde: 136
    },
    {
      id: 6,
      nombre: 'Fresh Cuts Barber',
      direccion: 'Av. Los Pinos 890',
      imagen: 'https://images.unsplash.com/photo-1620331311520-246422fd82f9?w=400',
      calificacion: 4.6,
      totalResenas: 76,
      servicios: ['Corte juvenil', 'Barba express', 'Tinte'],
      precioDesde: 75
    }
  ];

  barberoDestacados: Barbero[] = [
    {
      id: 1,
      nombre: 'Carlos Rodríguez',
      especialidad: 'Cortes modernos y fade',
      barberia: 'Barbería Los Patrones',
      imagen: 'https://i.pravatar.cc/300?img=12',
      calificacion: 4.9,
      totalCortes: 1250
    },
    {
      id: 2,
      nombre: 'Miguel Sánchez',
      especialidad: 'Barba y diseño',
      barberia: 'Elite Barber Shop',
      imagen: 'https://i.pravatar.cc/300?img=13',
      calificacion: 4.8,
      totalCortes: 980
    },
    {
      id: 3,
      nombre: 'David López',
      especialidad: 'Cortes clásicos',
      barberia: 'Classic Style Barber',
      imagen: 'https://i.pravatar.cc/300?img=15',
      calificacion: 4.9,
      totalCortes: 1150
    },
    {
      id: 4,
      nombre: 'Luis Torres',
      especialidad: 'Fade y degradado',
      barberia: 'Urban Cuts Studio',
      imagen: 'https://i.pravatar.cc/300?img=33',
      calificacion: 4.7,
      totalCortes: 890
    }
  ];

  cargarServiciosPopulares(): void {
    this.cargandoServicios = true;
    console.log('🔍 Cargando servicios populares...');
    this.serviciosService.obtenerServiciosMasPopulares().subscribe({
      next: (response: any) => {
        console.log('📦 Respuesta del backend:', response);
        console.log('✅ Success:', response.success);
        console.log('📊 Data:', response.data);
        console.log('📏 Data length:', response.data?.length);
        
        if (response.success && response.data && response.data.length > 0) {
          this.serviciosPopulares = response.data.map((servicio: any) => {
            const mapped = {
              nombre: servicio.nombre,
              descripcion: servicio.descripcion,
              imagen: this.obtenerUrlImagen(servicio.fotoUrl),
              precio: `S/ ${servicio.precio}`,
              totalReservas: servicio.totalReservas || 0
            };
            console.log('🎨 Servicio mapeado:', mapped);
            return mapped;
          });
          console.log('✨ Servicios populares cargados:', this.serviciosPopulares.length);
        } else {
          console.log('⚠️ No hay datos, usando servicios estáticos');
          // Fallback a servicios estáticos si no hay datos
          this.usarServiciosEstaticos();
        }
        this.cargandoServicios = false;
      },
      error: (error: any) => {
        console.error('❌ Error al cargar servicios populares:', error);
        console.error('Error completo:', JSON.stringify(error, null, 2));
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
    
    // Si es una URL completa, devolverla tal cual
    if (fotoUrl.startsWith('http')) return fotoUrl;
    
    // Si es una URL relativa del backend, agregar base URL
    if (fotoUrl.startsWith('/api/')) return baseUrl + fotoUrl;
    
    // Si es base64, devolverla tal cual
    if (fotoUrl.startsWith('data:')) return fotoUrl;
    
    return defaultImage;
  }

  onImageError(event: any): void {
    event.target.src = 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop';
  }
}
