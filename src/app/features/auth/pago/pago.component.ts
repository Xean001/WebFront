import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PagosService } from '../../../shared/services/pagos.service';

@Component({
  selector: 'app-pago',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pago.component.html',
  styleUrls: ['./pago.component.css']
})
export class PagoComponent implements OnInit {
  formularioPago: FormGroup;
  cargando: boolean = false;
  errores: { [key: string]: string } = {};
  idSuscripcion: string | null = null;
  monto: number = 0;
  pagoExitoso: boolean = false;
  metodoPagoSeleccionado: 'TARJETA' | 'PAYPAL' | 'STRIPE' = 'TARJETA';

  constructor(
    private fb: FormBuilder,
    private pagosService: PagosService,
    private router: Router
  ) {
    // Inicializar formulario en el constructor para evitar undefined
    this.formularioPago = this.crearFormulario();
  }

  ngOnInit(): void {
    this.idSuscripcion = sessionStorage.getItem('idSuscripcion');
    const montoStr = sessionStorage.getItem('montoAPagar');
    this.monto = montoStr ? parseFloat(montoStr) : 0;

    if (!this.idSuscripcion || this.monto <= 0) {
      this.router.navigate(['/auth/register-admin']);
      return;
    }
  }

  crearFormulario(): FormGroup {
    return this.fb.group({
      numeroTarjeta: ['', [Validators.required, Validators.pattern(/^\d{13,19}$/)]],
      nombreTitular: ['', [Validators.required, Validators.minLength(3)]],
      mesVencimiento: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])$/)]],
      anioVencimiento: ['', [Validators.required, Validators.pattern(/^\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  cambiarMetodoPago(metodo: 'TARJETA' | 'PAYPAL' | 'STRIPE'): void {
    this.metodoPagoSeleccionado = metodo;
    this.formularioPago.reset();
  }

  procesarPago(): void {
    if (this.formularioPago.invalid || !this.idSuscripcion) {
      this.marcarCamposComoTocados();
      this.errores['general'] = 'Por favor completa todos los campos correctamente';
      return;
    }

    this.cargando = true;
    this.errores = {};

    // Construir objeto según el método de pago
    let solicitudPago: any = {
      idSuscripcion: parseInt(this.idSuscripcion),
      metodoPago: this.metodoPagoSeleccionado,
      monto: this.monto
    };

    // Solo agregar datos de tarjeta si el método es TARJETA
    if (this.metodoPagoSeleccionado === 'TARJETA') {
      solicitudPago = {
        ...solicitudPago,
        numeroTarjeta: this.formularioPago.get('numeroTarjeta')?.value,
        nombreTitular: this.formularioPago.get('nombreTitular')?.value,
        mesVencimiento: this.formularioPago.get('mesVencimiento')?.value,
        anioVencimiento: this.formularioPago.get('anioVencimiento')?.value,
        cvv: this.formularioPago.get('cvv')?.value,
        email: this.formularioPago.get('email')?.value
      };
    } else {
      // Para otros métodos, solo agregar email
      solicitudPago = {
        ...solicitudPago,
        email: this.formularioPago.get('email')?.value
      };
    }

    this.pagosService.procesarPago(solicitudPago).subscribe({
      next: (response: any) => {
        this.cargando = false;
        
        if (response.success && response.data) {
          const estado = response.data.estado?.toUpperCase();
          
          if (estado === 'EXITOSO') {
            this.pagoExitoso = true;
            // Limpiar sessionStorage
            sessionStorage.removeItem('idSuscripcion');
            sessionStorage.removeItem('montoAPagar');
            
            // Redirigir al onboarding después de 3 segundos
            setTimeout(() => {
              this.router.navigate(['/auth/onboarding']);
            }, 3000);
          } else if (estado === 'PENDIENTE') {
            this.errores['general'] = '⏳ Pago pendiente de procesamiento. Se confirmará en breve.';
          } else {
            this.errores['general'] = `❌ Pago ${estado}: ${response.data.mensaje || 'Error al procesar'}`;
          }
        } else {
          this.errores['general'] = response.message || 'Error al procesar el pago';
        }
      },
      error: (error: any) => {
        this.cargando = false;
        
        // Manejar errores específicos
        switch(error.status) {
          case 400:
            if (error.error?.message) {
              this.errores['general'] = `❌ Datos inválidos: ${error.error.message}`;
            } else {
              this.errores['general'] = '❌ Datos de pago inválidos. Verifica todos los campos.';
            }
            break;
          case 401:
            this.errores['general'] = '❌ No autenticado. Por favor regresa al registro.';
            break;
          case 403:
            this.errores['general'] = '❌ Acceso denegado. Verifica tu suscripción.';
            break;
          case 409:
            this.errores['general'] = '❌ Esta suscripción ya tiene un pago en proceso.';
            break;
          case 422:
            this.errores['general'] = '❌ Tarjeta rechazada. Intenta con otra tarjeta.';
            break;
          case 500:
            this.errores['general'] = '❌ Error del servidor. Por favor intenta más tarde.';
            break;
          default:
            this.errores['general'] = error.error?.message || 'Error al procesar el pago. Por favor intenta de nuevo.';
        }
      }
    });
  }

  marcarCamposComoTocados(): void {
    Object.keys(this.formularioPago.controls).forEach(key => {
      this.formularioPago.get(key)?.markAsTouched();
    });
  }

  irAlRegistro(): void {
    sessionStorage.removeItem('idSuscripcion');
    sessionStorage.removeItem('montoAPagar');
    this.router.navigate(['/auth/register-admin']);
  }
}
