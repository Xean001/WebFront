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
  previsualizacionComprobante: string | null = null;
  comprobanteBase64: string | null = null;
  email: string = '';

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
    this.email = sessionStorage.getItem('emailUsuario') || '';
    this.monto = montoStr ? parseFloat(montoStr) : 0;

    if (!this.idSuscripcion || this.monto <= 0) {
      this.router.navigate(['/auth/register-admin']);
      return;
    }

    console.log('📋 Componente Cargar Comprobante inicializado');
    console.log('📊 ID Suscripción:', this.idSuscripcion);
    console.log('💰 Monto:', this.monto);
    console.log('📦 Tipo Plan:', this.tipoPlan);
    console.log('📧 Email:', this.email);

    this.obtenerDatosParaPagar();
  }

  crearFormulario(): FormGroup {
    return this.fb.group({
      numeroOperacion: ['', [Validators.required, Validators.minLength(6)]],
      comprobante: ['', [Validators.required]]
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
      // Validar tipo de archivo
      if (!archivo.type.startsWith('image/')) {
        this.errores['comprobante'] = 'Solo se aceptan imágenes (JPG, PNG, etc.)';
        this.archivoSeleccionado = null;
        this.previsualizacionComprobante = null;
        return;
      }

      // Validar tamaño (máx 5MB)
      if (archivo.size > 5 * 1024 * 1024) {
        this.errores['comprobante'] = 'La imagen no puede superar 5MB';
        this.archivoSeleccionado = null;
        this.previsualizacionComprobante = null;
        return;
      }

      this.archivoSeleccionado = archivo;
      this.errores['comprobante'] = '';
      console.log('📸 Archivo seleccionado:', archivo.name, 'Tamaño:', archivo.size, 'bytes');
      
      // Convertir a Base64 y mostrar previsualización
      this.convertirArchivoABase64(archivo);
    }
  }

  convertirArchivoABase64(archivo: File): void {
    const reader = new FileReader();
    
    reader.onload = (event: any) => {
      const base64 = event.target.result;
      this.comprobanteBase64 = base64; // Incluye "data:image/...;base64,..."
      this.previsualizacionComprobante = base64;
      console.log('✅ Archivo convertido a Base64');
      console.log('📏 Tamaño Base64:', base64.length, 'caracteres');
    };

    reader.onerror = (error: any) => {
      console.error('❌ Error al leer archivo:', error);
      this.errores['comprobante'] = 'Error al procesar la imagen';
    };

    reader.readAsDataURL(archivo);
  }

  registrarComprobante(): void {
    if (this.formulario.invalid || !this.idSuscripcion || !this.comprobanteBase64) {
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
      email: this.email,
      numeroOperacion: (this.formulario.get('numeroOperacion')?.value || '').trim(),
      comprobanteBase64: this.comprobanteBase64, // Base64 de la imagen
      comprobanteNombre: this.archivoSeleccionado?.name || 'comprobante.jpg'
    };

    console.log('📤 Registrando comprobante con imagen...');
    console.log('📦 Datos:', {
      idSuscripcion: datosComprobante.idSuscripcion,
      metodoPago: datosComprobante.metodoPago,
      monto: datosComprobante.monto,
      numeroOperacion: datosComprobante.numeroOperacion,
      comprobanteNombre: datosComprobante.comprobanteNombre,
      comprobanteBase64Length: datosComprobante.comprobanteBase64.length
    });

    this.pagosService.registrarComprobanteConImagen(datosComprobante).subscribe({
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
          sessionStorage.removeItem('emailUsuario');
          
          // Mostrar mensaje de éxito y redirigir después de 3 segundos
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
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
            this.errores['general'] = '❌ Error de validación. Verifica el número de operación e imagen.';
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
    sessionStorage.removeItem('emailUsuario');
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
