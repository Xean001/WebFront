import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PagosService } from '../../../shared/services/pagos.service';

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

  constructor(
    private fb: FormBuilder,
    private pagosService: PagosService
  ) {
    this.formularioAprobacion = this.crearFormularioAprobacion();
  }

  ngOnInit(): void {
    console.log('📋 Componente Pagos Solicitudes inicializado');
    this.cargarSolicitudesPago();
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
            this.errores['general'] = '❌ Acceso denegado. Solo administradores pueden ver esto.';
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

    this.procesandoAprobacion = true;
    console.log('❌ Rechazando pago...');

    this.pagosService.rechazarPago(this.solicitudSeleccionada.idPago, 'Rechazado por administrador').subscribe({
      next: (response: any) => {
        this.procesandoAprobacion = false;
        console.log('✅ Pago rechazado:', response);
        
        if (response.success) {
          console.log('✅ ¡Pago rechazado!');
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
