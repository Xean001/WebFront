# 🚀 PLAN DE IMPLEMENTACIÓN - GUÍA PASO A PASO

## 📋 ÍNDICE
1. [Flujo de Citas (CRÍTICO)](#1-flujo-de-citas---crítico)
2. [Dashboard Admin (IMPORTANTE)](#2-dashboard-admin)
3. [Búsqueda y Filtros (RECOMENDADO)](#3-búsqueda-y-filtros)
4. [Calificaciones (VALOR AGREGADO)](#4-calificaciones)
5. [Gestión de Personal (AVANZADO)](#5-gestión-de-personal)

---

## 1️⃣ FLUJO DE CITAS - CRÍTICO ⛔

### Estado Actual
- ❌ Componentes de citas existen pero no están conectados con API
- ❌ No hay validación de disponibilidad
- ❌ No hay integración con horarios de barberos

### Paso 1: Crear servicio CitasService completo

**Archivo:** `src/app/shared/services/citas.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CrearCitaRequest {
  idBarberia: number;
  idBarbero: number;
  idServicio: number;
  fecha: string;        // YYYY-MM-DD
  horaInicio: string;   // HH:mm
  observaciones?: string;
  codigoPromocion?: string;
}

export interface CitaDTO {
  idCita: number;
  codigoReserva: string;
  idBarberia: number;
  nombreBarberia: string;
  idBarbero: number;
  nombreBarbero: string;
  idCliente: number;
  nombreCliente: string;
  idServicio: number;
  nombreServicio: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  duracionMinutos: number;
  precio: number;
  precioOriginal: number;
  montoDescuento: number;
  codigoPromocionUsado: string;
  depositoRequerido: number;
  depositoPagado: boolean;
  montoPagado: number;
  metodoPago: string;
  estado: 'PENDIENTE' | 'CONFIRMADA' | 'EN_CURSO' | 'COMPLETADA' | 'CANCELADA' | 'NO_ASISTIO';
  requiereConfirmacion: boolean;
  observaciones: string;
  notasBarbero: string;
  origen: 'WEB' | 'MOVIL' | 'TELEFONO' | 'PRESENCIAL';
}

@Injectable({
  providedIn: 'root'
})
export class CitasService {
  private apiUrl = 'https://api.fadely.me/api/citas';

  constructor(private http: HttpClient) {}

  // CREAR CITA
  crearCita(request: CrearCitaRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}`, request);
  }

  // OBTENER MIS CITAS (cliente)
  obtenerMisCitas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/mis-citas`);
  }

  // OBTENER CITA POR CÓDIGO
  obtenerPorCodigo(codigoReserva: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/codigo/${codigoReserva}`);
  }

  // OBTENER CITAS DE BARBERÍA (admin)
  obtenerCitasPorBarberia(idBarberia: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/barberia/${idBarberia}`);
  }

  // OBTENER CITAS PENDIENTES (admin)
  obtenerCitasPendientes(idBarberia: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/barberia/${idBarberia}/pendientes`);
  }

  // OBTENER CITAS DE BARBERO
  obtenerCitasPorBarbero(idBarbero: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/barbero/${idBarbero}`);
  }

  // CONFIRMAR CITA
  confirmarCita(idCita: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${idCita}/confirmar`, {});
  }

  // COMPLETAR CITA
  completarCita(idCita: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${idCita}/completar`, {});
  }

  // CANCELAR CITA
  cancelarCita(idCita: number, motivo?: string): Observable<any> {
    let params = new HttpParams();
    if (motivo) {
      params = params.set('motivo', motivo);
    }
    return this.http.put(`${this.apiUrl}/${idCita}/cancelar`, {}, { params });
  }
}
```

### Paso 2: Crear componente para crear cita

**Ruta:** `/appointments/create`

```typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, CommonModule, ReactiveFormsModule } from '@angular/forms';
import { CitasService } from '../../../shared/services/citas.service';
import { HorariosService } from '../../../shared/services/horarios.service';
import { BarberiaService } from '../../../shared/services/barberias.service';
import { ServiciosService } from '../../../shared/services/servicios.service';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create.component.html',
  styleUrl: './create.component.css'
})
export class CreateComponent implements OnInit {
  formulario: FormGroup;
  barberias: any[] = [];
  barberos: any[] = [];
  servicios: any[] = [];
  horariosDisponibles: any[] = [];
  cargando = false;
  citaCreada: any = null;

  constructor(
    private fb: FormBuilder,
    private citasService: CitasService,
    private horariosService: HorariosService,
    private barberiaService: BarberiaService,
    private serviciosService: ServiciosService
  ) {
    this.formulario = this.fb.group({
      idBarberia: ['', Validators.required],
      idBarbero: ['', Validators.required],
      idServicio: ['', Validators.required],
      fecha: ['', Validators.required],
      horaInicio: ['', Validators.required],
      observaciones: ['']
    });
  }

  ngOnInit() {
    this.cargarBarberias();
    this.configurarCambios();
  }

  cargarBarberias() {
    // Usar GET /barberias/disponibles
  }

  configurarCambios() {
    // Al cambiar barbería, cargar sus servicios y barberos
    this.formulario.get('idBarberia')?.valueChanges.subscribe(idBarberia => {
      // Cargar barberos: GET /personal/barberos/{idBarberia}
      // Cargar servicios: GET /servicios/barberia/{idBarberia}
    });

    // Al cambiar fecha, verificar disponibilidad de barbero
    this.formulario.get('fecha')?.valueChanges.subscribe(fecha => {
      // Verificar: GET /horarios/barbero/{id}/disponibilidad/{fecha}
    });
  }

  guardarCita() {
    if (this.formulario.valid) {
      this.cargando = true;
      const request: CrearCitaRequest = {
        idBarberia: this.formulario.get('idBarberia')?.value,
        idBarbero: this.formulario.get('idBarbero')?.value,
        idServicio: this.formulario.get('idServicio')?.value,
        fecha: this.formulario.get('fecha')?.value,
        horaInicio: this.formulario.get('horaInicio')?.value,
        observaciones: this.formulario.get('observaciones')?.value
      };

      this.citasService.crearCita(request).subscribe({
        next: (response) => {
          if (response.success) {
            this.citaCreada = response.data;
            alert(`Cita creada! Código: ${response.data.codigoReserva}`);
          }
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al crear cita:', error);
          alert('Error al crear cita');
          this.cargando = false;
        }
      });
    }
  }
}
```

### Paso 3: Crear componente para listar mis citas

**Ruta:** `/appointments/list`

```typescript
// Similar al anterior pero obteniendo mis citas del cliente
// GET /citas/mis-citas
// Mostrar estado, permitir cancelar, ver detalles
```

### Paso 4: Validaciones Importantes

```typescript
// SIEMPRE validar disponibilidad ANTES de crear cita:
// 1. Verificar horario del barbero esa fecha
// 2. Verificar excepciones (vacaciones)
// 3. Verificar que no tenga otra cita a esa hora

verificarDisponibilidad(idBarbero: number, fecha: string): Observable<boolean> {
  return this.horariosService.verificarDisponibilidad(idBarbero, fecha);
}

// VALIDAR horarios de la barbería
verificarAbiertoBarberia(idBarberia: number, fecha: string, hora: string): boolean {
  // Comparar con GET /horarios/barberia/{idBarberia}
}
```

---

## 2️⃣ DASHBOARD ADMIN

### Componentes necesarios:

#### A. Widget de Citas Pendientes
```typescript
// Mostrar: GET /citas/barberia/{idBarberia}/pendientes
// Acciones:
//   - Confirmar: PUT /citas/{id}/confirmar
//   - Cancelar: PUT /citas/{id}/cancelar
//   - Ver detalles
```

#### B. Calendario de Citas
```typescript
// Mostrar todas las citas del día/semana/mes
// GET /citas/barberia/{idBarberia}
// Permitir cambiar estado
```

#### C. Estadísticas
```typescript
// Citas hoy, esta semana, este mes
// Citas completadas vs canceladas
// Ingreso generado
```

---

## 3️⃣ BÚSQUEDA Y FILTROS

### En Dashboard (Marketplace)

```typescript
// Agregar buscador mejorado
// GET /barberias/buscar?query=termino

// Agregar filtros por ciudad
// GET /barberias/ciudad/{ciudad}

// Filtros por servicios
// GET /servicios/categorias
// GET /servicios/destacados

// Paginación
// GET /barberias/buscar/paginadas?query=&page=0&size=10
```

---

## 4️⃣ CALIFICACIONES

### Después de completar cita:

```typescript
// POST /valoraciones
// Input: { idCita, puntuacionGeneral (1-5), comentario }

// Mostrar en perfil de barbero
// GET /valoraciones/barbero/{idBarbero}

// Mostrar en detalle de barbería
// GET /valoraciones/barberia/{idBarberia}
```

---

## 5️⃣ GESTIÓN DE PERSONAL

### Para ADMIN de barbería:

```typescript
// Crear barbero
// POST /personal/barbero
// Input: { nombre, correo, contrasena, idBarberia, especialidad, etc }

// Crear recepcionista
// POST /personal/recepcionista

// Ver personal
// GET /personal/barberia/{idBarberia}

// Actualizar permisos
// PUT /personal/{idUsuario}/barberia/{idBarberia}/permisos

// Desactivar empleado
// DELETE /personal/{idUsuario}/barberia/{idBarberia}
```

---

## 📊 ORDEN RECOMENDADO DE IMPLEMENTACIÓN

### Semana 1: CORE DE CITAS
- [ ] CitasService completado
- [ ] Componente crear cita
- [ ] Componente ver mis citas
- [ ] Validaciones de disponibilidad

### Semana 2: ADMIN DASHBOARD
- [ ] Widget citas pendientes
- [ ] Confirmar/cancelar citas
- [ ] Calendario básico

### Semana 3: EXPERIENCIA USUARIO
- [ ] Búsqueda mejorada
- [ ] Filtros por ciudad
- [ ] Calificaciones

### Semana 4+: AVANZADO
- [ ] Gestión de personal
- [ ] Promociones
- [ ] Reportes

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Servicios Angular
- [ ] CitasService creado y completo
- [ ] HorariosService validaciones
- [ ] PreciosService (para calcular con descuentos)

### Componentes
- [ ] /appointments/create - crear cita
- [ ] /appointments/list - mis citas
- [ ] Dashboard admin con citas
- [ ] Detalle de cita

### Validaciones
- [ ] Disponibilidad de barbero
- [ ] Horarios de barbería
- [ ] Excepciones (vacaciones)
- [ ] Solapamiento de citas

### UI/UX
- [ ] Calendario para seleccionar fecha
- [ ] Selector de hora con disponibilidad
- [ ] Confirmación de cita con todos los detalles
- [ ] Código de reserva visible

