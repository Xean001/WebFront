import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-register-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register-admin.component.html',
  styleUrls: ['./register-admin.component.css']
})
export class RegisterAdminComponent implements OnInit {
  formulario!: FormGroup;
  cargando: boolean = false;
  generosDisponibles: string[] = ['MASCULINO', 'FEMENINO', 'OTRO'];
  errores: { [key: string]: string } = {};

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
  }

  inicializarFormulario(): void {
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{7,15}$/)]],
      contrasena: ['', [Validators.required, Validators.minLength(8)]],
      confirmarContrasena: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      genero: ['MASCULINO', Validators.required],
      fotoPerfilUrl: ['']
    }, { validators: this.contraseñasCoincidan });
  }

  contraseñasCoincidan(group: FormGroup): { [key: string]: any } | null {
    const contrasena = group.get('contrasena')?.value;
    const confirmar = group.get('confirmarContrasena')?.value;
    
    if (contrasena && confirmar && contrasena !== confirmar) {
      return { contraseñasNoCoinciden: true };
    }
    return null;
  }

  registrar(): void {
    if (this.formulario.invalid) {
      this.marcarCamposComoTocados();
      return;
    }

    this.cargando = true;
    this.errores = {};

    const datos = {
      nombre: this.formulario.get('nombre')?.value,
      apellido: this.formulario.get('apellido')?.value,
      correo: this.formulario.get('correo')?.value,
      telefono: this.formulario.get('telefono')?.value,
      contrasena: this.formulario.get('contrasena')?.value,
      fechaNacimiento: this.formulario.get('fechaNacimiento')?.value,
      genero: this.formulario.get('genero')?.value,
      fotoPerfilUrl: this.formulario.get('fotoPerfilUrl')?.value || ''
    };

    this.authService.registrarAdmin(datos).subscribe({
      next: (response: any) => {
        this.cargando = false;
        if (response.success) {
          alert('¡Registro exitoso! Por favor inicia sesión');
          this.router.navigate(['/auth/login']);
        } else {
          this.errores['general'] = response.message || 'Error en el registro';
        }
      },
      error: (error: any) => {
        this.cargando = false;
        console.error('Error en registro:', error);
        
        if (error.error?.message) {
          this.errores['general'] = error.error.message;
        } else if (error.error?.errors) {
          Object.assign(this.errores, error.error.errors);
        } else {
          this.errores['general'] = 'Error al registrarse. Por favor intenta de nuevo.';
        }
      }
    });
  }

  marcarCamposComoTocados(): void {
    Object.keys(this.formulario.controls).forEach(key => {
      this.formulario.get(key)?.markAsTouched();
    });
  }
}
