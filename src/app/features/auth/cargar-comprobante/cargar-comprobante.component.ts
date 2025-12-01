import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PagosService } from '../../../shared/services/pagos.service';
import { AuthService, AuthResponse } from '../../../shared/services/auth.service';
import { SuscripcionService } from '../../../shared/services/suscripcion.service';

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
  metodoPagoSeleccionado: 'YAPE' | 'PLIN' = 'YAPE';
  datosParaPagar: any = null;
  comprobanteExitoso: boolean = false;
  archivoSeleccionado: File | null = null;
  previsualizacionComprobante: string | null = null;
  comprobanteBase64: string | null = null;
  email: string = '';
  currentUser: AuthResponse | null = null;

  constructor(
    private fb: FormBuilder,
    private pagosService: PagosService,
    private router: Router,
    private authService: AuthService,
    private suscripcionService: SuscripcionService
  ) {
    this.formulario = this.crearFormulario();
  }

  ngOnInit(): void {
    
    // IMPORTANTE: Si el usuario está autenticado, SIEMPRE obtener el ID desde el backend
    // El sessionStorage puede tener IDs incorrectos (idUsuario en lugar de idSuscripcion)
    const user = this.authService.getCurrentUser();
    
    if (user) {
      // Usuario autenticado: obtener datos del backend
      
      this.currentUser = user;
      this.email = user.correo || '';
      this.tipoPlan = user.tipoPlan || sessionStorage.getItem('tipoPlanSeleccionado') || 'MENSUAL';
      this.monto = this.obtenerMontoPorPlan(this.tipoPlan);
      
      // Usar /mis-suscripciones (plural) para obtener TODAS las suscripciones
      // Esto funciona incluso con suscripciones PENDIENTE_PAGO
      
      this.suscripcionService.obtenerMisSuscripciones().subscribe({
        next: (response) => {
          
          if (response.success && response.data && response.data.length > 0) {
            // Tomar la primera suscripción (o buscar la más reciente)
            const suscripcion = response.data[0];
            this.idSuscripcion = suscripcion.idSuscripcion.toString();
            
            // Actualizar monto con el precio real de la suscripción
            this.monto = suscripcion.precio;
            this.tipoPlan = suscripcion.tipoPlan;
            
            this.obtenerDatosParaPagar();
          } else {
            this.errores['general'] = '❌ No tienes ninguna suscripción. Por favor completa el registro primero.';
          }
        },
        error: (error) => {
          
          const mensaje = error.error?.message || error.message || 'Error desconocido';
          this.errores['general'] = `❌ No se pudieron obtener tus suscripciones.\n\nError: ${mensaje}\n\nContacta con soporte técnico.`;
        }
      });
      return;
    }
    
    // Si NO está autenticado, intentar sessionStorage (flujo de registro)
    
    this.idSuscripcion = sessionStorage.getItem('idSuscripcion');
    const montoStr = sessionStorage.getItem('montoAPagar');
    this.tipoPlan = sessionStorage.getItem('tipoPlan') || '';
    this.email = sessionStorage.getItem('emailUsuario') || '';
    this.monto = montoStr ? parseFloat(montoStr) : 0;

    // Si tampoco hay datos en sessionStorage, mostrar error
    if (!this.idSuscripcion || this.monto <= 0) {
      this.errores['general'] = '❌ Debes iniciar sesión para cargar el comprobante';
      setTimeout(() => {
        this.router.navigate(['/auth/login']);
      }, 2000);
      return;
    }

    // Flujo normal con datos del sessionStorage (usuario NO autenticado, recién registrado)
    console.log('📋 Usando datos de sessionStorage (registro nuevo)');
    console.log('📊 ID Suscripción:', this.idSuscripcion);
    console.log('💰 Monto:', this.monto);
    console.log('📦 Tipo Plan:', this.tipoPlan);
    console.log('📧 Email:', this.email);

    this.obtenerDatosParaPagar();
  }

  /**
   * Obtener monto según el tipo de plan
   */
  obtenerMontoPorPlan(tipoPlan: string): number {
    const planes: { [key: string]: number } = {
      'PRUEBA': 0,
      'MENSUAL': 49.90,
      'SEMESTRAL': 249.90,
      'ANUAL': 449.90
    };
    return planes[tipoPlan] || 49.90; // Por defecto MENSUAL
  }

  crearFormulario(): FormGroup {
    return this.fb.group({
      numeroOperacion: ['', [Validators.required, Validators.minLength(6)]],
      comprobante: ['', [Validators.required]]
    });
  }

  obtenerDatosParaPagar(): void {
    
    this.pagosService.obtenerDatosParaPagar(this.metodoPagoSeleccionado, this.monto).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.datosParaPagar = response.data;
        }
      },
      error: (error: any) => {
        this.errores['general'] = 'Error al obtener instrucciones de pago. Por favor intenta de nuevo.';
      }
    });
  }

  cambiarMetodoPago(metodo: 'YAPE' | 'PLIN'): void {
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
    };

    reader.onerror = (error: any) => {
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

    this.pagosService.registrarComprobanteConImagen(datosComprobante).subscribe({
      next: (response: any) => {
        this.cargando = false;
        
        if (response.success) {
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
        
        switch(error.status) {
          case 400:
            const mensaje400 = error.error?.message || 'Datos inválidos';
            
            if (mensaje400.includes('Suscripción no encontrada') || mensaje400.includes('suscripcion')) {
              this.errores['general'] = `❌ La suscripción con ID ${datosComprobante.idSuscripcion} no existe en el sistema. 
              
              Posibles soluciones:
              1. Cierra sesión y vuelve a registrarte
              2. Contacta con soporte técnico
              3. Tu registro puede no haberse completado correctamente
              
              ID que intentamos usar: ${datosComprobante.idSuscripcion}`;
            } else {
              this.errores['general'] = `❌ Datos inválidos: ${mensaje400}`;
            }
            break;
          case 401:
            this.errores['general'] = '❌ No autenticado. Por favor inicia sesión nuevamente.';
            setTimeout(() => this.router.navigate(['/auth/login']), 2000);
            break;
          case 403:
            this.errores['general'] = '❌ Acceso denegado. Verifica tu suscripción.';
            break;
          case 409:
            this.errores['general'] = '❌ Ya existe un comprobante pendiente para esta suscripción. Por favor espera la aprobación.';
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
    }).catch(() => {
    });
  }

  // Método para manejar error de carga de imagen QR
  onQRError(event: any): void {
    event.target.style.display = 'none';
  }
}
