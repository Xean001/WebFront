import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PagosService } from '../../../shared/services/pagos.service';

@Component({
  selector: 'app-cargar-comprobante',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cargar-comprobante.component.html',
  styleUrls: ['./cargar-comprobante.component.css']
})
export class CargarComprobanteComponent implements OnInit {
  formulario: FormGroup;
  cargando: boolean = false;
  errores: { [key: string]: string } = {};
  idSuscripcion: string | null = null;
  monto: number = 0;
  tipoPlan: string = '';
  metodoPagoSeleccionado: 'YAPE' | 'PLIN' | 'BANCO' = 'YAPE';
  datosParaPagar: any = null;
  comprobanteExitoso: boolean = false;
  archivoSeleccionado: File | null = null;

  constructor(
    private fb: FormBuilder,
    private pagosService: PagosService,
    private router: Router
  ) {
    this.formulario = this.crearFormulario();
  }

  ngOnInit(): void {
    this.idSuscripcion = sessionStorage.getItem('idSuscripcion');
    const montoStr = sessionStorage.getItem('montoAPagar');
    this.tipoPlan = sessionStorage.getItem('tipoPlan') || '';
    this.monto = montoStr ? parseFloat(montoStr) : 0;

    if (!this.idSuscripcion || this.monto <= 0) {
      this.router.navigate(['/auth/register-admin']);
      return;
    }

    console.log('📋 Componente Cargar Comprobante inicializado');
    console.log('📊 ID Suscripción:', this.idSuscripcion);
    console.log('💰 Monto:', this.monto);
    console.log('📦 Tipo Plan:', this.tipoPlan);

    this.obtenerDatosParaPagar();
  }

  crearFormulario(): FormGroup {
    return this.fb.group({
      numeroOperacion: ['', [Validators.required, Validators.minLength(6)]],
      comprobanteUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]]
    });
  }

  obtenerDatosParaPagar(): void {
    console.log('📊 Obteniendo datos para pagar con método:', this.metodoPagoSeleccionado);
    
    this.pagosService.obtenerDatosParaPagar(this.metodoPagoSeleccionado, this.monto).subscribe({
      next: (response: any) => {
        console.log('✅ Datos para pagar obtenidos:', response);
        if (response.success && response.data) {
          this.datosParaPagar = response.data;
        }
      },
      error: (error: any) => {
        console.error('❌ Error obteniendo datos para pagar:', error);
        this.errores['general'] = 'Error al obtener instrucciones de pago. Por favor intenta de nuevo.';
      }
    });
  }

  cambiarMetodoPago(metodo: 'YAPE' | 'PLIN' | 'BANCO'): void {
    this.metodoPagoSeleccionado = metodo;
    this.obtenerDatosParaPagar();
  }

  onArchivoSeleccionado(event: any): void {
    const archivo = event.target.files[0];
    if (archivo) {
      this.archivoSeleccionado = archivo;
      console.log('📸 Archivo seleccionado:', archivo.name);
      
      // Subir archivo y obtener URL (simulado)
      this.subirArchivo(archivo);
    }
  }

  subirArchivo(archivo: File): void {
    // En una aplicación real, aquí subirías el archivo a un servidor de almacenamiento
    // Por ahora, usamos una URL simulada
    const urlSimulada = URL.createObjectURL(archivo);
    console.log('📤 URL temporal del comprobante:', urlSimulada);
    
    // Si tienes un endpoint para subir archivos, úsalo aquí
    // Por ahora, el usuario puede usar la URL directa
  }

  registrarComprobante(): void {
    if (this.formulario.invalid || !this.idSuscripcion) {
      this.marcarCamposComoTocados();
      this.errores['general'] = 'Por favor completa todos los campos correctamente';
      return;
    }

    this.cargando = true;
    this.errores = {};

    const datosComprobante = {
      idSuscripcion: parseInt(this.idSuscripcion),
      metodoPago: this.metodoPagoSeleccionado,
      monto: this.monto,
      numeroOperacion: (this.formulario.get('numeroOperacion')?.value || '').trim(),
      comprobanteUrl: (this.formulario.get('comprobanteUrl')?.value || '').trim()
    };

    console.log('📤 Registrando comprobante...');
    console.log('📦 Datos:', JSON.stringify(datosComprobante, null, 2));

    this.pagosService.registrarComprobante(datosComprobante).subscribe({
      next: (response: any) => {
        this.cargando = false;
        console.log('✅ Respuesta del servidor:', response);
        
        if (response.success) {
          console.log('✅ ¡Comprobante registrado exitosamente!');
          this.comprobanteExitoso = true;
          
          // Limpiar sessionStorage
          sessionStorage.removeItem('idSuscripcion');
          sessionStorage.removeItem('montoAPagar');
          sessionStorage.removeItem('tipoPlan');
          
          // Mostrar mensaje de éxito y redirigir después de 3 segundos
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 3000);
        } else {
          this.errores['general'] = response.message || 'Error al registrar comprobante';
        }
      },
      error: (error: any) => {
        this.cargando = false;
        console.error('❌ Error al registrar comprobante');
        console.error('Status:', error.status);
        console.error('Respuesta:', error.error);
        
        switch(error.status) {
          case 400:
            this.errores['general'] = `❌ Datos inválidos: ${error.error?.message || 'Verifica los datos ingresados'}`;
            break;
          case 401:
            this.errores['general'] = '❌ No autenticado. Por favor regresa al registro.';
            break;
          case 403:
            this.errores['general'] = '❌ Acceso denegado. Verifica tu suscripción.';
            break;
          case 409:
            this.errores['general'] = '❌ Ya existe un comprobante pendiente para esta suscripción.';
            break;
          case 422:
            this.errores['general'] = '❌ Error de validación. Verifica el número de operación y URL del comprobante.';
            break;
          case 500:
            this.errores['general'] = '❌ Error del servidor. Por favor intenta más tarde.';
            break;
          default:
            this.errores['general'] = error.error?.message || 'Error al registrar comprobante. Por favor intenta de nuevo.';
        }
      }
    });
  }

  marcarCamposComoTocados(): void {
    Object.keys(this.formulario.controls).forEach(key => {
      this.formulario.get(key)?.markAsTouched();
    });
  }

  irAlRegistro(): void {
    sessionStorage.removeItem('idSuscripcion');
    sessionStorage.removeItem('montoAPagar');
    sessionStorage.removeItem('tipoPlan');
    this.router.navigate(['/auth/register-admin']);
  }

  // Método auxiliar para copiar al portapapeles
  copiarAlPortapapeles(texto: string, campo: string): void {
    navigator.clipboard.writeText(texto).then(() => {
      console.log(`✅ ${campo} copiado al portapapeles`);
    }).catch(() => {
      console.error(`❌ Error copiando ${campo}`);
    });
  }
}
