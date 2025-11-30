# 🖼️ Visualización de Imágenes en Panel SUPER_ADMIN

## Resumen
Guía de implementación para descargar y visualizar las imágenes de comprobantes almacenadas en BYTEA en el panel de SUPER_ADMIN.

---

## 📍 Ubicación de Datos

### Base de Datos (Backend)
**Tabla:** `pago_suscripcion`

**Columnas Relevantes:**
```sql
- id: BIGINT (PK)
- numero_operacion: VARCHAR - "00123456"
- comprobante_imagen: BYTEA - Binary image data (decoded from Base64)
- comprobante_tipo: VARCHAR - "image/jpeg" o "image/png"
- comprobante_nombre: VARCHAR - "comprobante.jpg"
- estado: VARCHAR - "PENDIENTE" | "APROBADO" | "RECHAZADO"
- fecha_creacion: TIMESTAMP
```

---

## 🔧 Implementación Frontend

### 1. Método en SuperAdminService

```typescript
// En: src/app/shared/services/super-admin.service.ts

/**
 * Descargar imagen de comprobante
 * GET /api/super-admin/pagos/{idPago}/comprobante/imagen
 * 
 * Retorna: Blob (datos binarios de la imagen)
 */
descargarComprobanteImagen(idPago: number): Observable<Blob> {
  console.log(`📥 Descargando comprobante para pago ${idPago}...`);
  
  return this.http.get(
    `${this.apiUrl}/pagos/${idPago}/comprobante/imagen`,
    { responseType: 'blob' }
  );
}

/**
 * Obtener URL de previsualización para imagen de comprobante
 * GET /api/super-admin/pagos/{idPago}/comprobante/preview
 * 
 * Retorna: JSON con URL temporal válida por 15 minutos
 */
obtenerUrlPreview(idPago: number): Observable<ApiResponse<{ url: string; expira: string }>> {
  console.log(`🔗 Obteniendo URL de previsualización para pago ${idPago}...`);
  
  return this.http.get<ApiResponse<{ url: string; expira: string }>>(
    `${this.apiUrl}/pagos/${idPago}/comprobante/preview`
  );
}

/**
 * Obtener detalles de comprobante
 * GET /api/super-admin/pagos/{idPago}/comprobante
 */
obtenerDetallesComprobante(idPago: number): Observable<ApiResponse<{
  idPago: number;
  numeroOperacion: string;
  comprobanteTipo: string;
  comprobanteNombre: string;
  fechaCarga: string;
  tamanio: number; // en bytes
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
}>> {
  return this.http.get<any>(
    `${this.apiUrl}/pagos/${idPago}/comprobante`
  );
}
```

---

### 2. Component para Ver Comprobante (Modal/Dialog)

**Ubicación:** `src/app/shared/components/ver-comprobante-modal/ver-comprobante-modal.component.ts`

```typescript
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SuperAdminService } from '../../services/super-admin.service';

@Component({
  selector: 'app-ver-comprobante-modal',
  templateUrl: './ver-comprobante-modal.component.html',
  styleUrls: ['./ver-comprobante-modal.component.css']
})
export class VerComprobanteModalComponent {
  cargando: boolean = false;
  urlPreview: string | null = null;
  detalles: any = null;
  error: string | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { idPago: number },
    private superAdminService: SuperAdminService,
    public dialogRef: MatDialogRef<VerComprobanteModalComponent>
  ) {
    this.cargarComprobante();
  }

  cargarComprobante(): void {
    this.cargando = true;
    this.error = null;

    // Cargar detalles y URL de previsualización
    Promise.all([
      this.superAdminService.obtenerDetallesComprobante(this.data.idPago).toPromise(),
      this.superAdminService.obtenerUrlPreview(this.data.idPago).toPromise()
    ]).then(([detalleRes, urlRes]) => {
      this.detalles = detalleRes?.data;
      this.urlPreview = urlRes?.data.url;
      this.cargando = false;
      
      console.log('✅ Comprobante cargado:', this.detalles);
    }).catch((error) => {
      this.error = 'Error al cargar comprobante: ' + error?.error?.message;
      this.cargando = false;
      console.error('❌ Error:', error);
    });
  }

  descargarImagen(): void {
    this.superAdminService.descargarComprobanteImagen(this.data.idPago).subscribe({
      next: (blob: Blob) => {
        // Crear descarga
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.detalles?.comprobanteNombre || `comprobante_${this.data.idPago}.jpg`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        console.log('✅ Imagen descargada:', a.download);
      },
      error: (error) => {
        this.error = 'Error al descargar: ' + error?.error?.message;
        console.error('❌ Error descargando:', error);
      }
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
```

**Template:** `ver-comprobante-modal.component.html`

```html
<h2 mat-dialog-title>Ver Comprobante de Pago</h2>

<mat-dialog-content>
  <!-- Loading -->
  <div *ngIf="cargando" class="loading-container">
    <mat-spinner diameter="50"></mat-spinner>
    <p>Cargando comprobante...</p>
  </div>

  <!-- Error -->
  <div *ngIf="error" class="error-banner">
    ❌ {{ error }}
  </div>

  <!-- Detalles -->
  <div *ngIf="detalles && !cargando" class="detalles-container">
    <div class="detalle-item">
      <span class="label">Número de Operación:</span>
      <span class="valor">{{ detalles.numeroOperacion }}</span>
    </div>
    <div class="detalle-item">
      <span class="label">Nombre del Archivo:</span>
      <span class="valor">{{ detalles.comprobanteNombre }}</span>
    </div>
    <div class="detalle-item">
      <span class="label">Tipo MIME:</span>
      <span class="valor">{{ detalles.comprobanteTipo }}</span>
    </div>
    <div class="detalle-item">
      <span class="label">Tamaño:</span>
      <span class="valor">{{ (detalles.tamanio / 1024) | number: '1.0-0' }} KB</span>
    </div>
    <div class="detalle-item">
      <span class="label">Fecha de Carga:</span>
      <span class="valor">{{ detalles.fechaCarga | date: 'short' }}</span>
    </div>
    <div class="detalle-item">
      <span class="label">Estado:</span>
      <span class="valor" [ngClass]="'estado-' + detalles.estado.toLowerCase()">
        {{ detalles.estado }}
      </span>
    </div>
  </div>

  <!-- Imagen -->
  <div *ngIf="urlPreview && !cargando" class="imagen-container">
    <h3>Previsualización de Imagen:</h3>
    <img [src]="urlPreview" alt="Comprobante" class="imagen-preview">
    <p class="preview-note">🔗 URL válida por 15 minutos</p>
  </div>
</mat-dialog-content>

<mat-dialog-actions align="end">
  <button mat-button (click)="cerrar()">Cerrar</button>
  <button 
    mat-raised-button 
    color="primary" 
    (click)="descargarImagen()"
    [disabled]="!detalles || cargando"
  >
    📥 Descargar Imagen
  </button>
</mat-dialog-actions>
```

**Estilos:** `ver-comprobante-modal.component.css`

```css
.loading-container {
  text-align: center;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.error-banner {
  background: rgba(255, 107, 107, 0.1);
  border: 2px solid #ff6b6b;
  color: #ff9999;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: 600;
}

.detalles-container {
  margin-bottom: 30px;
  background: rgba(0, 0, 0, 0.05);
  padding: 15px;
  border-radius: 8px;
}

.detalle-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  align-items: center;
}

.detalle-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
}

.valor {
  font-family: 'Courier New', monospace;
  color: #333;
  font-size: 0.95rem;
}

.estado-pendiente {
  background: #fff3cd;
  color: #856404;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
}

.estado-aprobado {
  background: #d4edda;
  color: #155724;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
}

.estado-rechazado {
  background: #f8d7da;
  color: #721c24;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
}

.imagen-container {
  margin-top: 30px;
}

.imagen-container h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.imagen-preview {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  border: 1px solid #ddd;
  display: block;
}

.preview-note {
  font-size: 0.85rem;
  color: #888;
  margin-top: 10px;
}
```

---

### 3. Integración en Panel de Pagos

**En pagos-solicitudes.component.ts:**

```typescript
import { MatDialog } from '@angular/material/dialog';
import { VerComprobanteModalComponent } from '../../shared/components/ver-comprobante-modal/ver-comprobante-modal.component';

export class PagosSolicitudesComponent {
  // ... código existente

  constructor(
    private dialog: MatDialog,
    // ... otros servicios
  ) {}

  verComprobante(idPago: number): void {
    const dialogRef = this.dialog.open(VerComprobanteModalComponent, {
      width: '600px',
      data: { idPago }
    });

    dialogRef.afterClosed().subscribe(() => {
      console.log('Modal cerrado');
    });
  }

  // En el método que lista pagos:
  cargarSolicitudesPago(): void {
    this.pagosService.obtenerSolicitudesPago().subscribe({
      next: (response) => {
        this.solicitudes = response.data.map(pago => ({
          ...pago,
          tieneComprobante: !!pago.comprobanteImagen
        }));
      }
    });
  }
}
```

**En pagos-solicitudes.component.html:**

```html
<!-- En tabla de pagos -->
<table>
  <tr *ngFor="let pago of solicitudes">
    <td>{{ pago.numeroOperacion }}</td>
    <td>{{ pago.monto | currency: 'PEN' }}</td>
    <td>{{ pago.metodoPago }}</td>
    <td>
      <button 
        *ngIf="pago.tieneComprobante"
        class="btn-ver-comprobante"
        (click)="verComprobante(pago.id)"
      >
        🖼️ Ver Comprobante
      </button>
      <span *ngIf="!pago.tieneComprobante" class="sin-comprobante">
        Sin comprobante
      </span>
    </td>
  </tr>
</table>
```

---

## 🔐 Seguridad

### Backend (Responsabilidades):

1. **Autenticación**
   ```
   GET /api/super-admin/pagos/{idPago}/comprobante/imagen
   ├─ Requiere header Authorization: Bearer token
   ├─ Valida que usuario sea SUPER_ADMIN
   └─ Verifica que token no sea expirado
   ```

2. **Autorización**
   ```
   - Solo SUPER_ADMIN puede descargar
   - Solo SUPER_ADMIN puede ver previsualización
   - Logging: Quién descargó, cuándo, qué archivo
   ```

3. **Límites de Rate**
   ```
   - Máx 10 descargas/minuto por usuario
   - Máx 100 previsiones/minuto por usuario
   - URLs temporales válidas 15 min (expiración)
   ```

4. **Headers de Seguridad**
   ```
   Content-Type: image/jpeg (o image/png)
   Content-Disposition: attachment; filename="comprobante.jpg"
   Cache-Control: no-cache, no-store, must-revalidate
   Pragma: no-cache
   Expires: 0
   X-Content-Type-Options: nosniff
   ```

### Frontend (Validaciones):

```typescript
// Validar MIME type antes de mostrar
if (!['image/jpeg', 'image/png'].includes(detalles.comprobanteTipo)) {
  throw new Error('Tipo de imagen no soportado');
}

// Validar tamaño
if (detalles.tamanio > 10 * 1024 * 1024) { // 10MB
  throw new Error('Archivo muy grande');
}

// Validar fecha (no mostrar imágenes muy antiguas)
const fechaCarga = new Date(detalles.fechaCarga);
const diasTranscurridos = (Date.now() - fechaCarga.getTime()) / (1000 * 60 * 60 * 24);
if (diasTranscurridos > 365) {
  console.warn('Comprobante antiguo: ' + diasTranscurridos + ' días');
}
```

---

## 📊 Flujo de Visualización

```
SUPER_ADMIN accede a Panel de Pagos
     ↓
Ve tabla de solicitudes pendientes
     ↓
Hace clic en botón "Ver Comprobante"
     ↓
Modal abre con:
  1. GET /api/super-admin/pagos/{id}/comprobante
  2. GET /api/super-admin/pagos/{id}/comprobante/preview
     ↓
Backend responde:
  - Detalles: numeroOperacion, tamaño, tipo, fecha
  - URL: Blob con datos binarios O URL temporal
     ↓
Frontend muestra:
  - Detalles en tabla
  - Previsualización de imagen
  - Botón de descarga
     ↓
SUPER_ADMIN puede:
  - Revisar imagen (en modal)
  - Descargar localmente
  - Aprobar o rechazar pago
```

---

## 🔄 Alternativas de Entrega

### Opción 1: Blob Directo (Recomendado)
```typescript
// Backend
responseType: 'blob'
return new ResponseEntity<>(imageBytes, HttpStatus.OK);

// Frontend
const blob = response; // Ya es Blob
const url = URL.createObjectURL(blob);
```

**Ventajas:**
- ✅ Más rápido
- ✅ Menos overhead
- ✅ Mejor para comprobante/descarga

**Desventajas:**
- ❌ No cacheable (cada acceso es request)

---

### Opción 2: Base64 en JSON
```typescript
// Backend
return {
  success: true,
  data: {
    comprobanteBase64: "data:image/jpeg;base64,/9j/4AAQ..."
  }
}

// Frontend
<img [src]="data.comprobanteBase64" />
```

**Ventajas:**
- ✅ Cacheable en navegador
- ✅ Funciona sin CORS complications

**Desventajas:**
- ❌ Payload JSON más grande (~25-40% más)
- ❌ Más lento en red

---

### Opción 3: URL Temporal Signed
```typescript
// Backend
const signedUrl = generateSignedUrl(idPago, expiresIn: 15min);
return { 
  url: "https://api.fadely.me/files/pago-456?token=abc123&expires=1234567890"
}

// Frontend
<img [src]="signedUrl" />
```

**Ventajas:**
- ✅ URLs cortas
- ✅ Control total de expiración
- ✅ Auditoría por token

**Desventajas:**
- ❌ Complejidad adicional
- ❌ Renovación de URLs

---

## 📋 Módulos Angular Necesarios

```typescript
// app.module.ts

import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    MatDialogModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    // ... otros módulos
  ]
})
export class AppModule { }
```

---

## 🧪 Testing

```typescript
// ver-comprobante-modal.component.spec.ts

describe('VerComprobanteModalComponent', () => {
  it('should load comprobante on init', fakeAsync(() => {
    const mockResponse = {
      data: {
        numeroOperacion: '00123456',
        comprobanteTipo: 'image/jpeg',
        tamanio: 250000
      }
    };
    
    spyOn(superAdminService, 'obtenerDetallesComprobante')
      .and.returnValue(of(mockResponse));
    
    component.cargarComprobante();
    
    expect(component.detalles).toEqual(mockResponse.data);
    expect(component.cargando).toBe(false);
  }));

  it('should download image on click', () => {
    const blob = new Blob(['test'], { type: 'image/jpeg' });
    spyOn(superAdminService, 'descargarComprobanteImagen')
      .and.returnValue(of(blob));
    
    component.descargarImagen();
    
    expect(superAdminService.descargarComprobanteImagen).toHaveBeenCalled();
  });
});
```

---

## ✅ Checklist de Implementación

- [ ] Método `descargarComprobanteImagen()` en SuperAdminService
- [ ] Método `obtenerUrlPreview()` en SuperAdminService  
- [ ] Método `obtenerDetallesComprobante()` en SuperAdminService
- [ ] Componente VerComprobanteModalComponent creado
- [ ] Template HTML del modal implementado
- [ ] Estilos CSS del modal completados
- [ ] Integración en PagosSolicitudesComponent
- [ ] Botón "Ver Comprobante" en tabla
- [ ] Validaciones de seguridad implementadas
- [ ] Manejo de errores completado
- [ ] Tests unitarios escritos
- [ ] Documentación completada

---

## 📞 Soporte

**Si hay problemas:**

1. Verificar que backend devuelve `responseType: 'blob'` correcto
2. Revisar CORS headers si hay error 403
3. Validar que SUPER_ADMIN tiene token válido
4. Revisar logs del navegador (F12 → Network)
5. Confirmar que BYTEA en BD tiene datos válidos

