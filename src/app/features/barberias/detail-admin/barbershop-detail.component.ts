import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BarberiaService, BarberiaDTO } from '../../../shared/services/barberias.service';
import { AuthService } from '../../../shared/services/auth.service';
import { ServiciosManagementComponent } from './servicios-management/servicios-management.component';
import { BarberosManagementComponent } from './barberos-management/barberos-management.component';

@Component({
  selector: 'app-barbershop-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ServiciosManagementComponent, BarberosManagementComponent],
  templateUrl: './barbershop-detail.component.html',
  styleUrls: ['./barbershop-detail.component.css']
})
export class BarbershopDetailComponent implements OnInit {
  barbershopId: number | null = null;
  barbershop: BarberiaDTO | null = null;
  formulario!: FormGroup;
  
  // Tabs
  tabActivo: 'datos' | 'servicios' | 'barberos' = 'datos';
  
  cargando: boolean = false;
  editando: boolean = false;
  errores: { [key: string]: string } = {};
  
  // Imágenes
  fotoPortadaPreview: string | null = null;
  logoPreview: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private barberiaService: BarberiaService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    // Obtener ID de la barbería desde la ruta
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.barbershopId = parseInt(id, 10);
        this.cargarBarberia();
      }
    });
  }

  cargarBarberia(): void {
    if (!this.barbershopId) return;

    this.cargando = true;
    this.barberiaService.obtenerBarberiaPorId(this.barbershopId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.barbershop = response.data;
          this.inicializarFormulario();
          
          // Cargar previews de imágenes si existen
          if (this.barbershop.fotoPortadaUrl) {
            this.fotoPortadaPreview = this.obtenerUrlCompleta(this.barbershop.fotoPortadaUrl);
          }
          if (this.barbershop.logoUrl) {
            this.logoPreview = this.obtenerUrlCompleta(this.barbershop.logoUrl);
          }
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar barbería:', error);
        this.cargando = false;
      }
    });
  }

  inicializarFormulario(): void {
    this.formulario = this.fb.group({
      nombre: [this.barbershop?.nombre || '', [Validators.required, Validators.minLength(3)]],
      ruc: [this.barbershop?.ruc || '', Validators.required],
      direccion: [this.barbershop?.direccion || '', Validators.required],
      ciudad: [this.barbershop?.ciudad || '', Validators.required],
      telefono: [this.barbershop?.telefono || '', Validators.required],
      email: [this.barbershop?.email || '', [Validators.required, Validators.email]],
      sitioWeb: [this.barbershop?.sitioWeb || ''],
      descripcion: [this.barbershop?.descripcion || ''],
      fotoPortadaUrl: [this.barbershop?.fotoPortadaUrl || ''],
      logoUrl: [this.barbershop?.logoUrl || ''],
      aceptaReservasOnline: [this.barbershop?.aceptaReservasOnline || true]
    });
  }

  cambiarTab(tab: 'datos' | 'servicios' | 'barberos'): void {
    this.tabActivo = tab;
  }

  toggleEdicion(): void {
    this.editando = !this.editando;
    if (!this.editando) {
      this.inicializarFormulario();
      this.errores = {};
    }
  }

  guardarCambios(): void {
    if (this.formulario.invalid || !this.barbershopId) {
      return;
    }

    this.cargando = true;
    const datos = this.formulario.value;

    // Si hay previews de imágenes, usar esas en lugar de las URLs antiguas
    if (this.fotoPortadaPreview) {
      datos.fotoPortadaUrl = this.fotoPortadaPreview;
    }
    if (this.logoPreview) {
      datos.logoUrl = this.logoPreview;
    }

    this.barberiaService.actualizarBarberia(this.barbershopId, datos).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Barbería actualizada exitosamente');
          this.barbershop = response.data;
          this.editando = false;
          // Limpiar previews
          this.fotoPortadaPreview = null;
          this.logoPreview = null;
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al actualizar:', error);
        this.errores['general'] = 'Error al actualizar la barbería';
        this.cargando = false;
      }
    });
  }

  volver(): void {
    this.router.navigate(['/barberias/administrar']);
  }

  onFileSelected(event: any, tipo: 'portada' | 'logo'): void {
    const file = event.target.files[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar los 5MB');
        return;
      }

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (tipo === 'portada') {
          this.fotoPortadaPreview = e.target.result;
          this.formulario.patchValue({ fotoPortadaUrl: e.target.result });
        } else {
          this.logoPreview = e.target.result;
          this.formulario.patchValue({ logoUrl: e.target.result });
        }
      };
      reader.readAsDataURL(file);
    }
  }

  eliminarImagen(tipo: 'portada' | 'logo'): void {
    if (tipo === 'portada') {
      this.fotoPortadaPreview = null;
      this.formulario.patchValue({ fotoPortadaUrl: '' });
    } else {
      this.logoPreview = null;
      this.formulario.patchValue({ logoUrl: '' });
    }
  }

  obtenerUrlCompleta(url: string): string {
    const baseUrl = 'https://api.fadely.me';
    
    // Si ya es una URL completa
    if (url.startsWith('http')) {
      return url;
    }
    
    // Si es una URL relativa del backend
    if (url.startsWith('/api/')) {
      return baseUrl + url;
    }
    
    // Si es base64, devolverla tal cual
    if (url.startsWith('data:')) {
      return url;
    }
    
    return url;
  }
}
