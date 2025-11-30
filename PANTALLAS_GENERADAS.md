# Pantallas y Componentes Generados para ProyectoFinalWeb

Este documento describe todas las pantallas en español generadas según los endpoints del backend.

## 📋 Resumen de Pantallas Creadas

### 1. **Listado de Barberías** (`lista-barberias`)
**Ruta:** `/barberias`

**Características:**
- Visualización de todas las barberías activas
- Búsqueda por nombre, ciudad o dirección
- Filtro por ciudad
- Paginación de resultados (10 items por página)
- Información visible: nombre, calificación, ubicación, teléfono, horarios
- Botones para ver disponibilidad

**Componente:** `ListaBarberiasComponent`
**Archivos:**
- `src/app/features/barberias/lista/lista.component.html`
- `src/app/features/barberias/lista/lista.component.ts`
- `src/app/features/barberias/lista/lista.component.css`

---

### 2. **Detalle de Barbería** (`detalle-barberia`)
**Ruta:** `/barberias/detalle/:id`

**Características:**
- Información completa de la barbería (descripción, contacto, dirección)
- Listado de servicios ofrecidos con precios y duración
- Información de barberos disponibles
- Calificación y opiniones
- Botón para ir a crear una cita

**Componente:** `DetalleBarberiasComponent`
**Archivos:**
- `src/app/features/barberias/detail/detail.component.html`
- `src/app/features/barberias/detail/detail.component.ts`
- `src/app/features/barberias/detail/detail.component.css`

---

### 3. **Crear Nueva Cita** (`crear-cita`)
**Ruta:** `/citas/crear`

**Características:**
- Proceso de 5 pasos:
  1. Seleccionar barbería
  2. Seleccionar servicio
  3. Seleccionar barbero (opcional)
  4. Seleccionar fecha y hora
  5. Agregar notas adicionales
- Resumen en tiempo real
- Validación completa del formulario

**Componente:** `CreateComponent`
**Archivos:**
- `src/app/features/appointments/create/create.component.html`
- `src/app/features/appointments/create/create.component.ts`

---

### 4. **Mis Citas** (`mis-citas`)
**Ruta:** `/citas/mis-citas`

**Características:**
- Vista de todas las citas del usuario (cliente)
- Filtrado por estado: Todas, Confirmadas, Pendientes, Canceladas, Completadas
- Información de cada cita: fecha, hora, servicio, barbero, precio
- Opción para cancelar citas
- Código de reserva único

**Componente:** `ListComponent`
**Archivos:**
- `src/app/features/appointments/list/list.component.html`
- `src/app/features/appointments/list/list.component.ts`

---

### 5. **Gestión de Citas** (`administrar-citas`)
**Ruta:** `/citas/administrar` (Admin/Barbero/Recepcionista)

**Características:**
- Vista de tabla responsiva con todas las citas
- Búsqueda por código de reserva o nombre de cliente
- Filtro por estado y fecha
- Botones de acción: Confirmar, Marcar como completada, Cancelar
- Vista de detalles en modal
- Versión mobile con vista de tarjetas

**Componente:** `AdministrarCitasComponent`
**Archivos:**
- `src/app/features/appointments/administrar/administrar.component.html`
- `src/app/features/appointments/administrar/administrar.component.ts`
- `src/app/features/appointments/administrar/administrar.component.css`

---

### 6. **Perfil de Barbero** (`perfil-barbero`)
**Ruta:** `/barberos/:id`

**Características:**
- Información del barbero: foto, nombre, especialidad
- Estadísticas: calificación, citas completadas, años de experiencia
- Listado de servicios que ofrece
- Galería de trabajos
- Información de contacto

**Componente:** `DetailComponent`
**Archivos:**
- `src/app/features/barbers/detail/detail.component.html`
- `src/app/features/barbers/detail/detail.component.ts`
- `src/app/features/barbers/detail/detail.component.css`

---

### 7. **Gestión de Servicios** (`gestionar-servicios`)
**Ruta:** `/servicios/gestionar` (Barbero)

**Características:**
- Crear nuevos servicios para el barbero
- Editar servicios existentes
- Eliminar servicios
- Campos: servicio, precio, duración
- Validación completa

**Componente:** `GestionarServiciosComponent`
**Archivos:**
- `src/app/features/servicios/gestionar/gestionar.component.html`
- `src/app/features/servicios/gestionar/gestionar.component.ts`
- `src/app/features/servicios/gestionar/gestionar.component.css`

---

### 8. **Gestión de Horarios** (`gestionar-horarios`)
**Ruta:** `/horarios/gestionar` (Barbero)

**Características:**
- **Tab 1: Mis Horarios**
  - Crear horarios por día de la semana
  - Marcar días de descanso
  - Establecer horas de apertura y cierre
  - Eliminar horarios

- **Tab 2: Excepciones**
  - Agregar excepciones de disponibilidad
  - Especificar rango de horas no disponibles
  - Motivo de la excepción
  - Eliminar excepciones

**Componente:** `GestionarHorariosComponent`
**Archivos:**
- `src/app/features/horarios/gestionar/gestionar.component.html`
- `src/app/features/horarios/gestionar/gestionar.component.ts`
- `src/app/features/horarios/gestionar/gestionar.component.css`

---

## 🔧 Servicios HTTP Creados

### 1. **CitasService** (`citas.service.ts`)
Métodos:
- `crearCita()` - Crear nueva cita
- `obtenerMisCitas()` - Obtener citas del cliente
- `obtenerCitasPorBarbero()` - Citas de un barbero
- `obtenerCitasPorBarberia()` - Citas de una barbería
- `obtenerCitasPendientes()` - Citas pendientes de confirmación
- `confirmarCita()` - Confirmar una cita
- `cancelarCita()` - Cancelar una cita
- `marcarComoCompletada()` - Marcar cita como completada

### 2. **BarberiaService** (`barberias.service.ts`)
Métodos:
- `obtenerBarberiasActivas()` - Todas las barberías activas
- `obtenerBarberiasDisponibles()` - Solo las que aceptan reservas online
- `obtenerBarberiaPorId()` - Detalles de una barbería
- `buscarBarberias()` - Búsqueda por query
- `obtenerPorCiudad()` - Filtrar por ciudad
- `obtenerCiudades()` - Listado de ciudades disponibles
- `obtenerBarberiasActivasPaginadas()` - Con paginación
- `buscarBarberiasPaginadas()` - Búsqueda con paginación

### 3. **ServiciosService** (`servicios.service.ts`)
Métodos:
- `obtenerPorBarberia()` - Servicios de una barbería
- `obtenerDestacados()` - Servicios destacados
- `obtenerPorId()` - Detalles de un servicio
- `obtenerCategorias()` - Categorías de servicios
- `crearServicio()` - Crear nuevo servicio
- `actualizarServicio()` - Actualizar servicio
- `eliminarServicio()` - Eliminar servicio

### 4. **HorariosService** (`horarios.service.ts`)
Métodos:
- `crearHorarioBarberia()` - Crear horario de barbería
- `listarHorariosBarberia()` - Horarios de barbería
- `actualizarHorarioBarberia()` - Actualizar horario
- `crearHorarioBarbero()` - Crear horario de barbero
- `listarHorariosBarbero()` - Horarios de barbero
- `actualizarHorarioBarbero()` - Actualizar horario
- `eliminarHorarioBarbero()` - Eliminar horario
- `crearExcepcion()` - Crear excepción
- `listarExcepciones()` - Listar excepciones
- `eliminarExcepcion()` - Eliminar excepción
- `verificarDisponibilidad()` - Verificar disponibilidad

### 5. **BarberoPerfilService** (`barbero-perfil.service.ts`)
Métodos:
- `obtenerMiPerfil()` - Perfil del barbero autenticado
- `obtenerPerfilPublico()` - Perfil público de un barbero
- `actualizarPerfil()` - Actualizar perfil
- `asignarServicio()` - Asignar servicio a barbero
- `listarMisServicios()` - Servicios del barbero
- `listarServiciosBarbero()` - Servicios de otro barbero
- `actualizarServicio()` - Actualizar servicio
- `eliminarServicio()` - Eliminar servicio
- `agregarFoto()` - Agregar foto a galería
- `listarMiGaleria()` - Galería del barbero
- `listarGaleriaBarbero()` - Galería de otro barbero
- `eliminarFoto()` - Eliminar foto
- `obtenerEstadisticas()` - Estadísticas del barbero

---

## 📱 Características Comunes

### Validación de Formularios
- Validación de entrada en todos los formularios
- Mensajes de error descriptivos
- Campos obligatorios marcados con asterisco (*)

### Diseño Responsive
- Todas las pantallas se adaptan a móvil, tablet y desktop
- Uso de Bootstrap 5 para consistencia

### Estados de Carga
- Indicadores de carga (spinner) durante operaciones
- Botones deshabilitados durante guardado

### Manejo de Errores
- Alertas en caso de error
- Mensajes informativos al usuario

### Iconos
- Uso de Bootstrap Icons (bi) en toda la aplicación

---

## 🔗 Integración con API

**URL Base:** `https://api.fadely.me/api`

Todos los servicios están configurados para consumir la API en esta URL. Los requests incluyen:
- Headers de autenticación (Bearer token)
- Content-Type: application/json
- Params cuando sea necesario

---

## 📝 Próximas Pantallas Recomendadas

Para completar la aplicación, se sugiere crear:

1. **Autenticación (Login/Registro)** - Componentes para iniciar sesión y registrarse
2. **Perfil de Usuario** - Ver y editar perfil personal
3. **Favoritos** - Guardar barberías favoritas
4. **Valoraciones** - Dejar opiniones y calificaciones
5. **Historial** - Ver historial de citas completadas
6. **Notificaciones** - Sistema de notificaciones

---

## 🎨 Convenciones de Nombres

- **Componentes:** Nombres en español, PascalCase
- **Rutas:** Nombres en español, minúsculas con guiones
- **Métodos:** camelCase en inglés (estándar de Angular)
- **Variables:** camelCase en inglés

---

**Generado:** Noviembre 29, 2025  
**Versión:** 1.0
