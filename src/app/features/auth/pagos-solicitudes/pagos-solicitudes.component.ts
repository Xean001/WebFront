import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PagosService } from '../../../shared/services/pagos.service';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-pagos-solicitudes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pagos-solicitudes.component.html',
  styleUrls: ['./pagos-solicitudes.component.css']
})
export class PagosSolicitudesComponent implements OnInit {
  solicitudesPago: any[] = [];
  cargando: boolean = false;
  errores: { [key: string]: string } = {};
  solicitudSeleccionada: any = null;
  formularioAprobacion: FormGroup;
  modalVisible: boolean = false;
  procesandoAprobacion: boolean = false;
  currentUser: any = null;
  isSuperAdmin: boolean = false;
  estadisticas = {
    totalPendientes: 0,
    montoTotal: 0,
    metodosDistintos: new Set<string>()
  };

  constructor(
    private fb: FormBuilder,
    private pagosService: PagosService,
    private authService: AuthService
  ) {
    this.formularioAprobacion = this.crearFormularioAprobacion();
  }

  ngOnInit(): void {
    console.log('📋 Componente Pagos Solicitudes inicializado');
    
    // Verificar que el usuario sea SUPER_ADMIN
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isSuperAdmin = user?.tipoUsuario === 'SUPER_ADMIN';
      console.log('👤 Usuario:', user?.nombre, 'Rol:', user?.tipoUsuario);
      console.log('👑 ¿Es SUPER_ADMIN?', this.isSuperAdmin);
      
      if (this.isSuperAdmin) {
        this.cargarSolicitudesPago();
      } else {
        this.errores['general'] = '❌ ACCESO DENEGADO: Solo SUPER_ADMIN puede acceder a este panel.';
      }
    });
  }

  crearFormularioAprobacion(): FormGroup {
    return this.fb.group({
      tipoPlanAprobado: ['', [Validators.required]],
      duracionDiasPersonalizada: ['']
    });
  }

  cargarSolicitudesPago(): void {
    console.log('📥 Cargando solicitudes de pago pendientes...');
    this.cargando = true;
    this.errores = {};

    this.pagosService.obtenerSolicitudesPago().subscribe({
      next: (response: any) => {
        this.cargando = false;
        console.log('✅ Solicitudes obtenidas:', response);
        
        if (response.success && response.data) {
          this.solicitudesPago = response.data;
          this.calcularEstadisticas();
          console.log(`📊 Total de solicitudes: ${this.solicitudesPago.length}`);
        } else {
          this.errores['general'] = response.message || 'Error al cargar solicitudes';
        }
      },
      error: (error: any) => {
        this.cargando = false;
        console.error('❌ Error al cargar solicitudes:', error);
        
        switch(error.status) {
          case 401:
            this.errores['general'] = '❌ No autenticado. Debes iniciar sesión.';
            break;
          case 403:
            this.errores['general'] = '❌ Acceso denegado. Solo SUPER_ADMIN puede ver esto.';
            break;
          case 500:
            this.errores['general'] = '❌ Error del servidor. Intenta más tarde.';
            break;
          default:
            this.errores['general'] = error.error?.message || 'Error al cargar solicitudes';
        }
      }
    });
  }

  calcularEstadisticas(): void {
    this.estadisticas.totalPendientes = this.solicitudesPago.length;
    this.estadisticas.montoTotal = this.solicitudesPago.reduce((sum, sol) => sum + (sol.monto || 0), 0);
    this.estadisticas.metodosDistintos.clear();
    
    this.solicitudesPago.forEach(sol => {
      if (sol.metodoPago) {
        this.estadisticas.metodosDistintos.add(sol.metodoPago);
      }
    });
    
    console.log('📊 Estadísticas calculadas:', {
      pendientes: this.estadisticas.totalPendientes,
      montoTotal: this.estadisticas.montoTotal,
      metodos: Array.from(this.estadisticas.metodosDistintos)
    });
  }

  abrirModalAprobacion(solicitud: any): void {
    this.solicitudSeleccionada = solicitud;
    this.formularioAprobacion.patchValue({
      tipoPlanAprobado: solicitud.tipoPlan || ''
    });
    this.modalVisible = true;
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.solicitudSeleccionada = null;
    this.formularioAprobacion.reset();
  }

  aprobarPago(): void {
    if (this.formularioAprobacion.invalid || !this.solicitudSeleccionada) {
      console.error('❌ Formulario inválido');
      return;
    }

    this.procesandoAprobacion = true;
    const datosAprobacion = {
      idPago: this.solicitudSeleccionada.idPago,
      tipoPlanAprobado: this.formularioAprobacion.get('tipoPlanAprobado')?.value,
      duracionDiasPersonalizada: this.formularioAprobacion.get('duracionDiasPersonalizada')?.value
    };

    console.log('✅ Aprobando pago...');
    console.log('📦 Datos:', JSON.stringify(datosAprobacion, null, 2));

    this.pagosService.aprobarConPlan(datosAprobacion).subscribe({
      next: (response: any) => {
        this.procesandoAprobacion = false;
        console.log('✅ Pago aprobado:', response);
        
        if (response.success) {
          console.log('✅ ¡Pago aprobado exitosamente!');
          
          // Actualizar estado de suscripción del usuario aprobado
          if (this.solicitudSeleccionada.idUsuario) {
            console.log('🔄 Actualizando estado de suscripción del usuario...');
            this.authService.actualizarEstadoSuscripcion(this.solicitudSeleccionada.idUsuario, 'ACTIVA');
          }
          
          this.cerrarModal();
          this.cargarSolicitudesPago(); // Recargar lista
        } else {
          this.errores['general'] = response.message || 'Error al aprobar pago';
        }
      },
      error: (error: any) => {
        this.procesandoAprobacion = false;
        console.error('❌ Error al aprobar pago:', error);
        this.errores['general'] = error.error?.message || 'Error al aprobar pago';
      }
    });
  }

  rechazarPago(): void {
    if (!this.solicitudSeleccionada) return;

    if (!confirm(`¿Estás seguro de rechazar el pago de ${this.solicitudSeleccionada.nombreUsuario}?`)) {
      return;
    }

    this.procesandoAprobacion = true;
    console.log('❌ Rechazando pago...');

    this.pagosService.rechazarPago(
      this.solicitudSeleccionada.idPago, 
      'Comprobante rechazado por SUPER_ADMIN'
    ).subscribe({
      next: (response: any) => {
        this.procesandoAprobacion = false;
        console.log('✅ Pago rechazado:', response);
        
        if (response.success) {
          console.log('✅ ¡Pago rechazado exitosamente!');
          this.cerrarModal();
          this.cargarSolicitudesPago(); // Recargar lista
        } else {
          this.errores['general'] = response.message || 'Error al rechazar pago';
        }
      },
      error: (error: any) => {
        this.procesandoAprobacion = false;
        console.error('❌ Error al rechazar pago:', error);
        this.errores['general'] = error.error?.message || 'Error al rechazar pago';
      }
    });
  }

  /**
   * Ver imagen del comprobante
   */
  verComprobanteImagen(solicitud: any): void {
    console.log('🖼️ Abriendo imagen del comprobante...');
    
    // Si tiene comprobanteBase64, mostrarlo directamente
    if (solicitud.comprobanteBase64) {
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>Comprobante - ${solicitud.nombreUsuario}</title></head>
            <body style="margin:0;display:flex;justify-content:center;align-items:center;background:#000;">
              <img src="${solicitud.comprobanteBase64}" style="max-width:100%;max-height:100vh;" />
            </body>
          </html>
        `);
      }
      return;
    }
    
    // Si no tiene Base64, intentar cargar desde API
    this.pagosService.verComprobanteImagen(solicitud.idPago).subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: (error: any) => {
        console.error('❌ Error cargando imagen:', error);
        alert('No se pudo cargar la imagen del comprobante');
      }
    });
  }

  obtenerPlanes(): string[] {
    return ['PRUEBA', 'MENSUAL', 'SEMESTRAL', 'ANUAL'];
  }

  obtenerDuracionDias(tipoPlan: string): number {
    const duraciones: { [key: string]: number } = {
      'PRUEBA': 7,
      'MENSUAL': 30,
      'SEMESTRAL': 180,
      'ANUAL': 365
    };
    return duraciones[tipoPlan] || 30;
  }
}
