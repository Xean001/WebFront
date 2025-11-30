import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Interfaz para procesar un pago
 */
export interface ProcesarPagoRequest {
  idSuscripcion: number;
  metodoPago: 'TARJETA' | 'TRANSFERENCIA' | 'PAYPAL' | 'STRIPE';
  monto: number;
  numeroTarjeta?: string;
  mesVencimiento?: string;
  anioVencimiento?: string;
  cvv?: string;
  nombreTitular?: string;
  email?: string;
  token?: string; // Para Stripe/PayPal
}

/**
 * Interfaz para la respuesta de pago
 */
export interface PagoResponse {
  idPago?: number;
  idSuscripcion: number;
  estado: 'EXITOSO' | 'FALLIDO' | 'PENDIENTE';
  monto: number;
  metodoPago: string;
  transaccionId?: string;
  fecha?: string;
  mensaje?: string;
}

/**
 * Respuesta estándar de la API
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class PagosService {
  private apiUrl = 'https://api.fadely.me/api/pagos';

  constructor(private http: HttpClient) { }

  /**
   * Procesar pago para suscripción
   * POST /pagos/procesar
   */
  procesarPago(pagoRequest: ProcesarPagoRequest): Observable<ApiResponse<PagoResponse>> {
    console.log('💳 Procesando pago...');
    console.log('📤 URL:', `${this.apiUrl}/procesar`);
    console.log('📦 Datos:', JSON.stringify(pagoRequest, null, 2));
    
    return this.http.post<ApiResponse<PagoResponse>>(`${this.apiUrl}/procesar`, pagoRequest);
  }

  /**
   * Obtener historial de pagos del usuario
   * GET /pagos/historial
   * Requiere: Autenticación
   */
  obtenerHistorialPagos(): Observable<ApiResponse<PagoResponse[]>> {
    return this.http.get<ApiResponse<PagoResponse[]>>(`${this.apiUrl}/historial`);
  }

  /**
   * Obtener detalles de un pago específico
   * GET /pagos/{idPago}
   * Requiere: Autenticación
   */
  obtenerDetallePago(idPago: number): Observable<ApiResponse<PagoResponse>> {
    return this.http.get<ApiResponse<PagoResponse>>(`${this.apiUrl}/${idPago}`);
  }

  /**
   * Validar tarjeta de crédito
   * POST /pagos/validar-tarjeta
   */
  validarTarjeta(numeroTarjeta: string): Observable<ApiResponse<{ valida: boolean; tipo?: string }>> {
    return this.http.post<ApiResponse<{ valida: boolean; tipo?: string }>>(`${this.apiUrl}/validar-tarjeta`, { numeroTarjeta });
  }

/**
   * Procesar reembolso
   * POST /pagos/{idPago}/reembolso
   * Requiere: Autenticación
   */
  procesarReembolso(idPago: number): Observable<ApiResponse<PagoResponse>> {
    return this.http.post<ApiResponse<PagoResponse>>(`${this.apiUrl}/${idPago}/reembolso`, {});
  }

  /**
   * Obtener datos para realizar pago manual
   * GET /pagos/datos-pago?metodoPago=YAPE&monto=99
   */
  obtenerDatosParaPagar(metodoPago: 'YAPE' | 'PLIN' | 'BANCO', monto: number): Observable<ApiResponse<any>> {
    console.log('📊 Obteniendo datos para pagar...');
    console.log(`📤 Método: ${metodoPago}, Monto: ${monto}`);
    
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/datos-pago`,
      { params: { metodoPago, monto: monto.toString() } }
    );
  }

  /**
   * Registrar comprobante de pago (URL - Legacy)
   * POST /pagos/registrar-comprobante
   */
  registrarComprobante(datos: {
    idSuscripcion: number;
    metodoPago: 'YAPE' | 'PLIN' | 'BANCO';
    monto: number;
    numeroOperacion: string;
    comprobanteUrl: string;
  }): Observable<ApiResponse<any>> {
    console.log('📤 Registrando comprobante (URL)...');
    console.log('📦 Datos:', JSON.stringify(datos, null, 2));
    
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/registrar-comprobante`, datos);
  }

  /**
   * Registrar comprobante de pago con imagen en Base64
   * POST /pagos/registrar-comprobante-imagen
   * 
   * @param datos Objeto con imagen Base64 (data:image/jpeg;base64,...), numero de operación, etc
   * 
   * Body esperado:
   * {
   *   idSuscripcion: number,
   *   metodoPago: 'YAPE' | 'PLIN' | 'BANCO',
   *   monto: number,
   *   email: string,
   *   numeroOperacion: string,
   *   comprobanteBase64: string (ej: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."),
   *   comprobanteNombre: string (ej: "comprobante.jpg")
   * }
   * 
   * El servidor:
   * 1. Decodifica el Base64
   * 2. Extrae el tipo MIME del header (image/jpeg, image/png, etc)
   * 3. Almacena en BYTEA column (comprobante_imagen)
   * 4. Guarda metadatos: numero_operacion, comprobante_tipo, comprobante_nombre
   * 5. Crea registro en pago_suscripcion con estado PENDIENTE
   */
  registrarComprobanteConImagen(datos: {
    idSuscripcion: number;
    metodoPago: 'YAPE' | 'PLIN' | 'BANCO';
    monto: number;
    email: string;
    numeroOperacion: string;
    comprobanteBase64: string; // "data:image/jpeg;base64,..." o "data:image/png;base64,..."
    comprobanteNombre: string;
  }): Observable<ApiResponse<any>> {
    console.log('📸 Registrando comprobante con imagen Base64...');
    console.log('📦 Datos:', {
      idSuscripcion: datos.idSuscripcion,
      metodoPago: datos.metodoPago,
      monto: datos.monto,
      email: datos.email,
      numeroOperacion: datos.numeroOperacion,
      comprobanteNombre: datos.comprobanteNombre,
      comprobanteBase64Length: datos.comprobanteBase64.length,
      comprobanteBase64Prefix: datos.comprobanteBase64.substring(0, 50) + '...'
    });
    
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/registrar-comprobante-imagen`,
      datos
    );
  }

  /**
   * Obtener solicitudes de pago pendientes (para SUPER_ADMIN)
   * GET /pagos/solicitudes
   * Requiere: Autenticación y rol SUPER_ADMIN
   */
  obtenerSolicitudesPago(): Observable<ApiResponse<any[]>> {
    console.log('📋 Obteniendo solicitudes de pago pendientes...');
    
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/solicitudes`);
  }

  /**
   * Aprobar pago y asignar plan
   * POST /pagos/aprobar-con-plan
   * Requiere: Autenticación y rol SUPER_ADMIN
   */
  aprobarConPlan(datos: {
    idPago: number;
    tipoPlanAprobado?: 'PRUEBA' | 'MENSUAL' | 'SEMESTRAL' | 'ANUAL';
    duracionDiasPersonalizada?: number;
  }): Observable<ApiResponse<any>> {
    console.log('✅ Aprobando pago con plan...');
    console.log('📦 Datos:', JSON.stringify(datos, null, 2));
    
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/aprobar-con-plan`, datos);
  }

  /**
   * Rechazar pago
   * POST /pagos/{idPago}/rechazar
   * Requiere: Autenticación y rol SUPER_ADMIN
   */
  rechazarPago(idPago: number, razon?: string): Observable<ApiResponse<any>> {
    console.log('❌ Rechazando pago...');
    
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/${idPago}/rechazar`,
      { razon: razon || 'Rechazado por admin' }
    );
  }
}