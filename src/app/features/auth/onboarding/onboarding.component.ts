import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BarberiaService, BarberiaDTO } from '../../../shared/services/barberias.service';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.css']
})
export class OnboardingComponent implements OnInit {
  formulario!: FormGroup;
  cargando: boolean = false;
  errores: { [key: string]: string } = {};
  currentStep: number = 1; // Steps: 1=Básico, 2=Ubicación, 3=Contacto, 4=Reservas, 5=Confirmar
  usuario: any = null;

  constructor(
    private fb: FormBuilder,
    private barberiaService: BarberiaService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verificar que el usuario esté autenticado
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.usuario = this.authService.getCurrentUser();
    this.inicializarFormulario();
  }

  inicializarFormulario(): void {
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      ruc: ['', [Validators.required, Validators.pattern(/^[0-9]{11}$/)]],
      direccion: ['', [Validators.required, Validators.minLength(5)]],
      ciudad: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{7,15}$/)]],
      email: ['', [Validators.required, Validators.email]],
      sitioWeb: [''],
      descripcion: [''],
      fotoPortadaUrl: [''],
      logoUrl: [''],
      aceptaReservasOnline: [true]
    });
  }

  crearOrganizacion(): void {
    if (this.formulario.invalid) {
      this.marcarCamposComoTocados();
      return;
    }

    this.cargando = true;
    this.errores = {};

    const barberia: BarberiaDTO = {
      nombre: this.formulario.get('nombre')?.value,
      ruc: this.formulario.get('ruc')?.value,
      direccion: this.formulario.get('direccion')?.value,
      ciudad: this.formulario.get('ciudad')?.value,
      telefono: this.formulario.get('telefono')?.value,
      email: this.formulario.get('email')?.value,
      sitioWeb: this.formulario.get('sitioWeb')?.value || '',
      descripcion: this.formulario.get('descripcion')?.value || '',
      fotoPortadaUrl: this.formulario.get('fotoPortadaUrl')?.value || '',
      logoUrl: this.formulario.get('logoUrl')?.value || '',
      aceptaReservasOnline: this.formulario.get('aceptaReservasOnline')?.value || true
    };

    this.barberiaService.crearBarberia(barberia).subscribe({
      next: (response: any) => {
        this.cargando = false;
        if (response.success && response.data) {
          // Guardar el ID de la barbería en el usuario actual
          this.authService.setBarberiaId(response.data.idBarberia);
          this.currentStep = 6; // Mostrar confirmación
          
          // Redirigir a la página de administración después de 2 segundos
          setTimeout(() => {
            this.router.navigate(['/barberias/administrar']);
          }, 2000);
        } else {
          this.errores['general'] = response.message || 'Error al crear la organización';
        }
      },
      error: (error: any) => {
        this.cargando = false;
        console.error('Error al crear organización:', error);
        
        // Determinar el mensaje de error según el código de estado
        if (error.status === 403) {
          this.errores['general'] = 'No tienes permisos para crear una barbería. Asegúrate de estar registrado como Administrador. Por favor, regístrate en /auth/register-admin';
        } else if (error.status === 401) {
          this.errores['general'] = 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.';
          this.router.navigate(['/auth/login']);
        } else if (error.status === 400) {
          if (error.error?.message) {
            this.errores['general'] = error.error.message;
          } else if (error.error?.errors) {
            Object.assign(this.errores, error.error.errors);
            this.errores['general'] = 'Por favor verifica los datos ingresados.';
          } else {
            this.errores['general'] = 'Datos inválidos. Por favor verifica los campos.';
          }
        } else if (error.error?.message) {
          this.errores['general'] = error.error.message;
        } else if (error.error?.errors) {
          Object.assign(this.errores, error.error.errors);
        } else if (error.status === 0) {
          this.errores['general'] = 'No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.';
        } else {
          this.errores['general'] = `Error: ${error.statusText || 'Desconocido'}. Por favor intenta de nuevo.`;
        }
      }
    });
  }

  nextStep(): void {
    if (this.isStepValid()) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  isStepValid(): boolean {
    switch (this.currentStep) {
      case 1:
        return (this.formulario.get('nombre')?.valid ?? false) && 
               (this.formulario.get('ruc')?.valid ?? false);
      case 2:
        return (this.formulario.get('direccion')?.valid ?? false) && 
               (this.formulario.get('ciudad')?.valid ?? false);
      case 3:
        return (this.formulario.get('telefono')?.valid ?? false) && 
               (this.formulario.get('email')?.valid ?? false);
      case 4:
        return true; // Optional fields
      case 5:
        return true;
      default:
        return false;
    }
  }

  marcarCamposComoTocados(): void {
    Object.keys(this.formulario.controls).forEach(key => {
      this.formulario.get(key)?.markAsTouched();
    });
  }

  irAPerfil(): void {
    this.router.navigate(['/users/edit-profile']);
  }
}
