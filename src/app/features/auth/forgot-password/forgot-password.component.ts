import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, 
    RouterModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  forgotForm: FormGroup;
  loading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void { }

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { email } = this.forgotForm.value;
    console.log('Solicitud de recuperación para:', email);

    // Lógica de RECUPERACIÓN (Simulación)
    setTimeout(() => {
      this.loading = false;
      if (email === 'notfound@example.com') {
        this.errorMessage = 'No se encontró una cuenta con ese correo.';
      } else {
        this.successMessage = `Se ha enviado un enlace de recuperación a ${email}. Revisa tu bandeja de entrada.`;
      }
    }, 1500);
  }
}