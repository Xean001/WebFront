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

    this.barberiaService.actualizarBarberia(this.barbershopId, datos).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Barbería actualizada exitosamente');
          this.barbershop = response.data;
          this.editando = false;
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
}
