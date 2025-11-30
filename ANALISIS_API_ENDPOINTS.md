# 📡 ANÁLISIS COMPLETO DEL API - ENDPOINTS Y FUNCIONALIDADES

**Base URL:** `https://api.fadely.me/api`  
**Autenticación:** JWT Bearer Token en header  
**Seguridad:** Roles basados en `tipoUsuario`

---

## 🔐 AUTENTICACIÓN

### ✅ Implementados en Frontend
```
POST /auth/login
  - Input: { correo, contrasena }
  - Output: { token, tipoUsuario, idUsuario, nombre, correo }
  - Público (sin token)

POST /auth/registro  
  - Input: { nombre, apellido?, correo, telefono?, contrasena, fechaNacimiento?, genero? }
  - Output: { token, tipoUsuario, idUsuario, nombre, correo }
  - Público (sin token)
  - Crea usuario con rol CLIENTE automáticamente

POST /auth/admin/crear
  - Input: { nombre, apellido?, correo, telefono?, contrasena, fechaNacimiento?, genero?, fotoPerfilUrl? }
  - Output: AuthResponse
  - ⛔ PROTEGIDO: Solo SUPER_ADMIN
  - Crea usuario con rol ADMIN
```

---

## 🏪 BARBERÍAS

### 📖 Públicos (sin autenticación necesaria)

```
GET /barberias/activas
  - Output: ListBarberiaDTO[]
  - Listar todas las barberías activas
  - ✅ YA IMPLEMENTADO en dashboard

GET /barberias/activas/paginadas
  - Params: page=0, size=10
  - Output: PageResponse { content[], pageNumber, pageSize, totalElements, totalPages, last, first }
  - Mismo que anterior pero con paginación
  - 🔄 PENDIENTE: Usar en listado de barberías

GET /barberias/disponibles
  - Output: ListBarberiaDTO[]
  - Barberías activas que aceptan reservas online
  - 🔄 PENDIENTE: Filtrar en marketplace

GET /barberias/buscar?query=termino
  - Params: query (búsqueda por nombre/ciudad/dirección)
  - Output: ListBarberiaDTO[]
  - ✅ RECOMENDADO: Agregar buscador en dashboard

GET /barberias/buscar/paginadas?query=termino&page=0&size=10
  - Con paginación
  - ✅ RECOMENDADO: Usar en búsqueda avanzada

GET /barberias/ciudades
  - Output: ListString[] (lista de ciudades)
  - ✅ RECOMENDADO: Para filtros por ciudad

GET /barberias/ciudad/{ciudad}
  - Output: ListBarberiaDTO[]
  - Listar barberías por ciudad específica
  - ✅ RECOMENDADO: Agregar filtro en listado

GET /barberias/{id}
  - Output: BarberiaDTO
  - Detalle completo de barbería
  - ✅ YA IMPLEMENTADO

### 🔧 Administrativos (requiere rol ADMIN de esa barbería)

POST /barberias
  - Input: BarberiaDTO { nombre, ruc, direccion, ciudad, latitud, longitud, telefono, email, etc }
  - Output: BarberiaDTO
  - ✅ YA IMPLEMENTADO en administrar barberías

PUT /barberias/{id}
  - Actualizar datos de barbería
  - ✅ YA IMPLEMENTADO

PUT /barberias/{id}/estado
  - Params: estado (ACTIVA | INACTIVA | SUSPENDIDA)
  - ⚙️ PENDIENTE: Agregar botón para cambiar estado
```

---

## 👨‍💼 SERVICIOS

### 📖 Públicos

```
GET /servicios/destacados
  - Output: ListServicioDTO[]
  - Servicios marcados como destacados
  - ✅ IMPLEMENTAR en dashboard (mostrar servicios populares)

GET /servicios/categorias
  - Output: ListString[] (ej: "Corte", "Barba", "Tinte", etc)
  - Todas las categorías disponibles
  - ✅ USAR en filtro de servicios

GET /servicios/barberia/{idBarberia}
  - Output: ListServicioDTO[]
  - Todos los servicios de una barbería
  - ✅ YA IMPLEMENTADO en detalle de barbería

GET /servicios/{id}
  - Output: ServicioDTO
  - Detalle de servicio individual
  - 🔄 PENDIENTE: Ver en modal

### 🔧 Administrativos (ADMIN de la barbería)

POST /servicios
  - Input: ServicioDTO
  - ✅ YA IMPLEMENTADO en administrar servicios

PUT /servicios/{id}
  - Actualizar servicio
  - ✅ YA IMPLEMENTADO

DELETE /servicios/{id}
  - Eliminar servicio
  - ✅ YA IMPLEMENTADO

📌 CAMPOS CLAVE DE SERVICIO:
  - nombre, descripcion, precio
  - precioDesde (boolean): si el precio es "desde"
  - duracionMinutos
  - categoria
  - serviciosIncluidos (ej: "Champú, corte, peinado")
  - fotoUrl
  - destacado (boolean)
  - activo (boolean)
```

---

## 👨‍💻 BARBEROS / PERFILES

### 📖 Públicos

```
GET /barbers/list  (en tu ruta, llama a /personal/barberos/{idBarberia})
  
GET /personal/barberos/{idBarberia}
  - Output: ListBarberoPerfil[]
  - Todos los barberos de una barbería
  - ✅ IMPLEMENTADO en listado de barberos

GET /barbero/perfil/{idBarbero}
  - Output: BarberoPerfil completo
  - Perfil público del barbero
  - ✅ IMPLEMENTADO en detalle de barbero

GET /barbero/{idBarbero}/galeria
  - Output: ListGaleriaBarbero[]
  - Fotos y trabajos del barbero
  - ✅ IMPLEMENTADO en detalle de barbero

GET /barbero/{idBarbero}/servicios
  - Output: ListBarberoServicio[]
  - Servicios que ofrece específicamente ese barbero
  - 🔄 PENDIENTE: Mostrar en perfil

GET /barbero/{idBarbero}/estadisticas
  - Output: BarberoPerfil (con estadísticas)
  - totalServiciosCompletados, valoracionPromedio, totalValoraciones
  - ✅ RECOMENDADO: Mostrar en perfil del barbero

GET /valoraciones/barbero/{idBarbero}
  - Output: ListValoracionDTO[]
  - Reseñas/calificaciones del barbero
  - ✅ RECOMENDADO: Mostrar en perfil del barbero

### 🔧 BARBERO (requiere ser BARBERO)

GET /api/barbero/perfil
  - Output: BarberoPerfil
  - Obtener su propio perfil
  - 🔄 PENDIENTE: Implementar en /barbers/manage

PUT /api/barbero/perfil
  - Input: ActualizarPerfilBarberoRequest
  - Actualizar especialidad, biografía, redes sociales, etc
  - 🔄 PENDIENTE: Formulario de edición

POST /api/barbero/galeria
  - Agregar fotos a su galería
  - 🔄 PENDIENTE: Upload de fotos

DELETE /api/barbero/galeria/{idFoto}
  - Eliminar foto de galería
  - 🔄 PENDIENTE: Botón eliminar

GET /api/barbero/galeria
  - Listar sus propias fotos
  - 🔄 PENDIENTE: Ver en /barbers/manage

GET /api/barbero/servicios
  - Output: ListBarberoServicio[]
  - Sus servicios asignados
  - ✅ IMPLEMENTADO en /servicios/gestionar

POST /api/barbero/servicios
  - Input: AsignarServicioRequest { idServicio, precioPersonalizado?, duracionPersonalizada? }
  - Asignarse un servicio con precio/duración personalizada
  - ✅ IMPLEMENTADO en /servicios/gestionar

PUT /api/barbero/servicios/{idBarberoServicio}
  - Actualizar su precio/duración de servicio
  - 🔄 PENDIENTE: Botón editar en listado

DELETE /api/barbero/servicios/{idBarberoServicio}
  - Dejar de ofrecer un servicio
  - 🔄 PENDIENTE: Botón eliminar
```

---

## 📅 HORARIOS

### 📖 Públicos

```
GET /horarios/barbero/{idBarbero}/disponibilidad/{fecha}
  - Params: idBarbero, fecha (YYYY-MM-DD)
  - Output: boolean
  - Verificar si barbero tiene disponibilidad esa fecha
  - ✅ USAR en flujo de citas (verificar antes de crear)

### 🔧 BARBERÍA (ADMIN)

GET /horarios/barberia/{idBarberia}
  - Output: ListHorarioBarberia[]
  - Horarios de apertura/cierre de la barbería
  - ✅ YA IMPLEMENTADO en /horarios/administrar

POST /horarios/barberia/{idBarberia}
  - Input: HorarioBarberiaRequest { diaSemana, horaApertura, horaCierre, cerrado? }
  - ✅ YA IMPLEMENTADO

PUT /horarios/barberia/{idHorario}
  - ✅ YA IMPLEMENTADO

### 🔧 BARBERO (requiere rol BARBERO)

GET /horarios/barbero/{idBarbero}
  - Output: ListHorarioBarbero[]
  - Horarios del barbero
  - 🔄 PENDIENTE: Mostrar en /barbers/manage

GET /horarios/barbero/mis-horarios
  - Sus propios horarios
  - 🔄 PENDIENTE: Mostrar en panel barbero

POST /horarios/barbero
  - Input: HorarioBarberoRequest { diaSemana, horaInicio, horaFin, activo? }
  - 🔄 PENDIENTE: Permitir barbero crear sus horarios

PUT /horarios/barbero/{idHorario}
  - 🔄 PENDIENTE: Editar horario

DELETE /horarios/barbero/{idHorario}
  - 🔄 PENDIENTE: Eliminar horario

### 🔄 EXCEPCIONES (Vacaciones, cierre especial, etc)

POST /horarios/excepciones
  - Input: ExcepcionHorarioRequest { fechaInicio, fechaFin, motivo, esVacaciones? }
  - Crear período de cierre/vacaciones
  - 🔄 PENDIENTE: Agregar opción en /horarios/administrar

GET /horarios/excepciones/barbero/{idBarbero}
  - Output: ListExcepcionHorario[]
  - 🔄 PENDIENTE: Ver excepciones del barbero

GET /horarios/excepciones/barbero/{idBarbero}/fecha/{fecha}
  - Verificar si hay excepción en esa fecha
  - 🔄 PENDIENTE: Validar en flujo de citas

DELETE /horarios/excepciones/{idExcepcion}
  - 🔄 PENDIENTE: Botón eliminar excepción
```

---

## 📆 CITAS / RESERVAS

### 🔄 FLUJO DE CITAS (CRÍTICO - PENDIENTE DE IMPLEMENTAR)

### 📖 Públicos/CLIENTE

```
POST /citas
  - Input: CrearCitaRequest {
      idBarberia, 
      idBarbero, 
      idServicio, 
      fecha (YYYY-MM-DD),
      horaInicio (LocalTime),
      observaciones?,
      codigoPromocion?
    }
  - Output: CitaDTO con codigoReserva
  - ⛔ CRÍTICO: IMPLEMENTAR flujo completo de reserva

GET /citas/mis-citas
  - Output: ListCitaDTO[]
  - Todas las citas del usuario autenticado (CLIENTE)
  - 🔄 PENDIENTE: Mostrar historial de citas

GET /citas/codigo/{codigoReserva}
  - Output: CitaDTO
  - Ver detalles de cita por código
  - 🔄 PENDIENTE: Buscar cita por código

GET /citas/barberia/{idBarberia}
  - Output: ListCitaDTO[]
  - ✅ ADMIN: Ver todas las citas de su barbería
  - 🔄 PENDIENTE: Dashboard admin con citas

GET /citas/barberia/{idBarberia}/pendientes
  - Output: ListCitaDTO[]
  - ✅ ADMIN: Citas que requieren confirmación
  - 🔄 PENDIENTE: Mostrar widget en dashboard

GET /citas/barbero/{idBarbero}
  - Output: ListCitaDTO[]
  - ✅ BARBERO: Sus citas asignadas
  - 🔄 PENDIENTE: Ver en /barbers/manage

### 🔧 OPERACIONES SOBRE CITAS

PUT /citas/{id}/confirmar
  - Confirmar cita pendiente
  - 🔄 PENDIENTE: Botón en dashboard admin

PUT /citas/{id}/completar
  - Marcar cita como completada
  - 🔄 PENDIENTE: Al terminar el día

PUT /citas/{id}/cancelar
  - Cancelar cita con motivo opcional
  - 🔄 PENDIENTE: Botón para cancelar

📌 ESTADOS DE CITA:
  PENDIENTE, CONFIRMADA, EN_CURSO, COMPLETADA, CANCELADA, NO_ASISTIO

📌 CAMPOS IMPORTANTES:
  - codigoReserva (único, para cliente buscar cita)
  - estado (estado actual)
  - depositoRequerido, depositoPagado, metodoPago
  - precioOriginal, montoDescuento, montoPagado
  - requiereConfirmacion (si cliente debe confirmar)
```

---

## ⭐ VALORACIONES / RESEÑAS

### 🔄 FUNCIONALIDAD IMPORTANTE - PARCIALMENTE IMPLEMENTABLE

```
POST /valoraciones
  - Input: CrearValoracionRequest {
      idCita,
      puntuacionGeneral (1-5),
      comentario?
    }
  - Output: ValoracionDTO
  - 🔄 PENDIENTE: Formulario después de completar cita

GET /valoraciones/barbero/{idBarbero}
  - Output: ListValoracionDTO[]
  - Todas las reseñas del barbero
  - 🔄 PENDIENTE: Mostrar en perfil del barbero

GET /valoraciones/barberia/{idBarberia}
  - Output: ListValoracionDTO[]
  - Todas las reseñas de la barbería
  - 🔄 PENDIENTE: Mostrar en detalle de barbería

PUT /valoraciones/{id}/responder
  - Params: id, respuesta (texto)
  - Barbería responde a una reseña
  - 🔄 PENDIENTE: Panel para responder reseñas

📌 CAMPOS VALORACIÓN:
  - puntuacionGeneral (1-5)
  - comentario
  - respuestaBarberia (respuesta del admin)
  - nombreCliente, nombreBarbero
  - publicado (boolean)
```

---

## 🎁 PROMOCIONES

### 🔄 FUNCIONALIDAD AVANZADA - PENDIENTE

```
GET /promociones/barberia/{idBarberia}
  - Output: ListPromocion[]
  - Todas las promociones de una barbería
  - 🔄 PENDIENTE: Mostrar en detalle de barbería

GET /promociones/barberia/{idBarberia}/activas
  - Output: ListPromocion[]
  - Solo promociones activas
  - 🔄 PENDIENTE: Usar en citas para aplicar descuento

GET /promociones/validar/{codigo}/barberia/{idBarberia}
  - Params: codigo (ej: "VERANO20")
  - Output: Promocion
  - Validar código y obtener descuento
  - ✅ USAR en flujo de citas

POST /promociones/barberia/{idBarberia}
  - Input: CrearPromocionRequest {
      codigo, descripcion, tipoDescuento (PORCENTAJE|MONTO_FIJO),
      valorDescuento, fechaInicio, fechaFin,
      usosMaximos?, montoMinimo?
    }
  - ⚙️ PENDIENTE: Crear en admin de barbería

PUT /promociones/{idPromocion}
  - Actualizar promoción
  - ⚙️ PENDIENTE

DELETE /promociones/{idPromocion}
  - Desactivar promoción
  - ⚙️ PENDIENTE

📌 CAMPOS PROMOCION:
  - codigo (único)
  - tipoDescuento: PORCENTAJE | MONTO_FIJO
  - valorDescuento
  - descuentoMaximo (límite si es porcentaje)
  - aplicaTodosServicios | serviciosAplicables
  - aplicaSoloNuevosClientes
  - usosMaximos, usosPorCliente
```

---

## 👥 PERSONAL / GESTIÓN DE EMPLEADOS

### 🔧 ADMIN - Crear Empleados

```
POST /personal/barbero
  - Input: CrearBarberoRequest {
      nombre, apellido?, correo, telefono?,
      contrasena, fechaNacimiento?, genero?,
      idBarberia,
      especialidad?, anosExperiencia?, biografia?,
      fechaInicioTrabajo?
    }
  - Output: BarberoPerfil
  - ⚙️ PENDIENTE: Formulario para crear barbero

POST /personal/recepcionista
  - Input: CrearRecepcionistaRequest {
      nombre, apellido?, correo, telefono?,
      contrasena, fechaNacimiento?, genero?,
      idBarberia,
      rol (PROPIETARIO|ADMINISTRADOR|BARBERO|RECEPCIONISTA)
    }
  - Output: PermisosUsuarioBarberia
  - ⚙️ PENDIENTE: Crear recepcionista

GET /personal/barberia/{idBarberia}
  - Output: ListPermisosUsuarioBarberia[]
  - Todo el personal de la barbería
  - 🔄 PENDIENTE: Mostrar en admin

DELETE /personal/{idUsuario}/barberia/{idBarberia}
  - Desactivar empleado
  - 🔄 PENDIENTE: Botón eliminar en listado

PUT /personal/{idUsuario}/barberia/{idBarberia}/permisos
  - Input: PermisosUsuarioBarberia
  - Actualizar permisos/rol del empleado
  - 🔄 PENDIENTE: Panel de permisos

📌 ROLES DE PERSONAL:
  PROPIETARIO, ADMINISTRADOR, BARBERO, RECEPCIONISTA

📌 PERMISOS:
  puedeEditarServicios, puedeGestionarCitas, 
  puedeVerReportes, puedeGestionarBarberos
```

---

## 📊 RECOMENDACIONES PRIORITARIAS POR ROL

### 🎯 PRIORITARIO INMEDIATO (Sprint Actual)

#### Para CLIENTE:
1. ⛔ **IMPLEMENTAR FLUJO DE CITAS COMPLETO**
   - Crear cita (POST /citas)
   - Ver mis citas (GET /citas/mis-citas)
   - Cancelar cita (PUT /citas/{id}/cancelar)
   - Validar disponibilidad (GET /horarios/barbero/{id}/disponibilidad/{fecha})

2. 📌 **Búsqueda y Filtros Mejorados**
   - Buscar barberías (GET /barberias/buscar)
   - Filtrar por ciudad (GET /barberias/ciudad/{ciudad})
   - Filtrar servicios por categoría (GET /servicios/categorias)

3. ⭐ **Ver Calificaciones**
   - Reseñas de barbería (GET /valoraciones/barberia/{id})
   - Reseñas de barbero (GET /valoraciones/barbero/{id})

#### Para ADMIN:
1. 📊 **DASHBOARD CON MÉTRICAS**
   - Citas hoy: GET /citas/barberia/{id}/pendientes
   - Todas las citas: GET /citas/barberia/{id}
   - Cambiar estado de cita: PUT /citas/{id}/confirmar

2. 🎁 **Gestión de Promociones**
   - Crear promociones: POST /promociones/barberia/{id}
   - Listar promociones: GET /promociones/barberia/{id}

3. 👥 **Gestión de Personal**
   - Crear barbero: POST /personal/barbero
   - Crear recepcionista: POST /personal/recepcionista
   - Ver personal: GET /personal/barberia/{id}

#### Para BARBERO:
1. 📅 **Gestión de Horarios**
   - Ver horarios: GET /horarios/barbero/mis-horarios
   - Crear horario: POST /horarios/barbero
   - Crear excepción (vacaciones): POST /horarios/excepciones

2. 📋 **Ver Citas Asignadas**
   - GET /citas/barbero/{id}
   - Completar cita: PUT /citas/{id}/completar

3. 📸 **Galería y Perfil**
   - Agregar fotos: POST /barbero/galeria
   - Editar perfil: PUT /barbero/perfil

---

## 📈 ROADMAP DE IMPLEMENTACIÓN

### FASE 1: Funcionalidades Core (Semanas 1-2)
- ✅ Flujo completo de citas
- ✅ Dashboard admin con citas
- ✅ Búsqueda y filtros de barberías
- ✅ Horarios de barbería (ya existe)
- ✅ Servicios (ya existe)

### FASE 2: Experiencia Usuario (Semanas 3-4)
- ⭐ Sistema de calificaciones/reseñas
- 📅 Horarios de barbero
- 📸 Galería de barbero
- 🎁 Promociones básicas

### FASE 3: Avanzado (Semanas 5-6)
- 👥 Gestión completa de personal (barberos, recepcionistas)
- 📊 Reportes y analíticas
- 🔔 Notificaciones
- 💳 Integración de pagos

### FASE 4: Optimización (Semana 7+)
- 📱 App móvil
- 🔍 Búsqueda avanzada con filtros complejos
- 💬 Chat con barbería
- ⏰ Recordatorios automáticos

---

## 🔒 MATRIZ DE PERMISOS POR ROL

| Endpoint | CLIENTE | BARBERO | ADMIN | RECEPCIONISTA | SUPER_ADMIN |
|----------|---------|---------|-------|---------------|-------------|
| POST /citas | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /citas/mis-citas | ✅ | ✅ | - | - | - |
| GET /citas/barberia/{id} | ❌ | ❌ | ✅ | ✅ | ✅ |
| GET /citas/barbero/{id} | ❌ | ✅ | ❌ | ❌ | ✅ |
| PUT /citas/{id}/confirmar | ❌ | ❌ | ✅ | ✅ | ✅ |
| PUT /citas/{id}/completar | ❌ | ✅ | ✅ | ✅ | ✅ |
| POST /barberias | ❌ | ❌ | ✅ | ❌ | ✅ |
| PUT /barberias/{id} | ❌ | ❌ | ✅ | ❌ | ✅ |
| POST /servicios | ❌ | ❌ | ✅ | ❌ | ✅ |
| POST /personal/barbero | ❌ | ❌ | ✅ | ❌ | ✅ |
| POST /horarios/barberia | ❌ | ❌ | ✅ | ❌ | ✅ |
| POST /horarios/barbero | ❌ | ✅ | ❌ | ❌ | ✅ |
| POST /valoraciones | ✅ | ❌ | ❌ | ❌ | ✅ |
| PUT /valoraciones/{id}/responder | ❌ | ❌ | ✅ | ❌ | ✅ |
| POST /promociones | ❌ | ❌ | ✅ | ❌ | ✅ |

---

## 📝 NOTAS IMPORTANTES

1. **Todos los endpoints protegidos requieren token JWT** en header: `Authorization: Bearer {token}`

2. **Validar siempre disponibilidad** antes de crear cita:
   - GET /horarios/barbero/{idBarbero}/disponibilidad/{fecha}
   - GET /horarios/excepciones/barbero/{idBarbero}/fecha/{fecha}

3. **Estados de cita son secuenciales:**
   ```
   PENDIENTE → CONFIRMADA → EN_CURSO → COMPLETADA
                         ↓
                      CANCELADA / NO_ASISTIO
   ```

4. **Código de reserva:** Es único para cada cita, debe guardarse para búsqueda rápida

5. **Promociones:** Se validan en creación de cita y se aplican automáticamente si son válidas

6. **Permisos granulares:** El sistema soporta permisos por usuario y barbería específica

---

## 🎯 CONCLUSIÓN

El API es **muy completo** y soporta prácticamente toda funcionalidad necesaria. Las prioridades son:

1. **INMEDIATO:** Flujo de citas (es el core del negocio)
2. **IMPORTANTE:** Dashboard admin con gestión de citas
3. **RECOMENDADO:** Búsqueda mejorada en marketplace
4. **VALOR AGREGADO:** Sistema de calificaciones
5. **AVANZADO:** Promociones y gestión de personal

Con estos endpoints implementados correctamente, tendrás una plataforma muy funcional y profesional.

