import { Component, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router'; 
import { CommonModule } from '@angular/common';
import { AuthService, LoginRequest } from '../../../shared/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule], //Dependencias q se importan
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{
  loginForm: FormGroup;
  loading: boolean = false;
  errorMessage: string = '';
  returnUrl: string = '/dashboard';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Obtener la URL a la que redirigir después del login
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { correo, password } = this.loginForm.value;

    const loginRequest: LoginRequest = {
      correo: correo,
      contrasena: password
    };

    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        this.loading = false;
        // Pequeño delay para asegurar que el token se guardó
        setTimeout(() => {
          this.router.navigate([this.returnUrl]);
        }, 100);
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        
        if (error.status === 401) {
          this.errorMessage = 'Credenciales inválidas. Verifica tu correo y contraseña.';
        } else if (error.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.';
        } else if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Ocurrió un error al iniciar sesión. Por favor, intenta de nuevo.';
        }
      }
    });
  }
}
