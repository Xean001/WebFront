import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, RegisterRequest } from '../../../shared/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

// esta vaina es de cuando tu te registras ps y piden confirmacion de contra bla bla xd
export function passwordMatchValidator(group: FormGroup) {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { mismatch: true }; 
}

@Component({
  selector: 'app-register',
  standalone: true, 
  imports: [
    CommonModule,
    ReactiveFormsModule, 
    RouterModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  loading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  validationErrors: { [key: string]: string } = {};
  generosDisponibles: string[] = ['MASCULINO', 'FEMENINO', 'OTRO'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.pattern(/^[0-9]{7,15}$/)],
      fechaNacimiento: [''],
      genero: ['MASCULINO'],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordMatchValidator }); // Aplica el validador global
  }

  ngOnInit(): void {
    // Componente listo para registro
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.validationErrors = {};

    const { nombre, apellido, correo, telefono, fechaNacimiento, genero, password } = this.registerForm.value;

    const registerRequest: RegisterRequest = {
      nombre: nombre,
      apellido: apellido || undefined,
      correo: correo,
      telefono: telefono || undefined,
      contrasena: password,
      fechaNacimiento: fechaNacimiento || undefined,
      genero: genero || undefined
    };

    console.log('Intentando registrar:', nombre, correo);

    this.authService.register(registerRequest).subscribe({
      next: (response) => {
        console.log('Registro exitoso!', response);
        this.loading = false;
        this.successMessage = '¡Registro exitoso! Redireccionando al dashboard...';
        setTimeout(() => this.router.navigate(['/dashboard']), 1500);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error en el registro:', error);
        this.loading = false;
        
        if (error.status === 400) {
          // Error de validación
          if (error.error?.validationErrors) {
            this.validationErrors = error.error.validationErrors;
            this.errorMessage = 'Por favor corrige los errores en el formulario.';
          } else if (error.error?.message) {
            this.errorMessage = error.error.message;
          } else {
            this.errorMessage = 'Datos inválidos. Por favor verifica los campos.';
          }
        } else if (error.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.';
        } else if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Ocurrió un error al registrar. Por favor, intenta de nuevo.';
        }
      }
    });
  }

  // Obtener mensaje de error de validación para un campo específico
  getFieldError(fieldName: string): string | null {
    if (this.validationErrors[fieldName]) {
      return this.validationErrors[fieldName];
    }
    return null;
  }
}
