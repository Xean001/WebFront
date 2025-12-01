# 🐛 **PROBLEMA CRÍTICO: Suscripción no encontrada**

## 📋 **Descripción del Error**

```
❌ Error 400: La suscripción con ID 19 no existe en el sistema
```

**Usuario afectado:** anghelolerma@gmail.com (ID Usuario: 19)

---

## ✅ **CONFIRMACIÓN: El Frontend Está Correcto**

### **Swagger Specification:**
```json
POST /api/pagos/registrar-comprobante
{
  "idSuscripcion": 0,
  "metodoPago": "string",
  "monto": 0,
  "email": "string",
  "numeroOperacion": "string",
  "comprobanteBase64": "string",
  "comprobanteNombre": "string"
}
```

### **Lo que envía el Frontend:**
```json
{
  "idSuscripcion": 19,                    ✅ Correcto (número)
  "metodoPago": "YAPE",                   ✅ Correcto (string)
  "monto": 249,                           ✅ Correcto (número)
  "email": "anghelolerma@gmail.com",      ✅ Correcto (string)
  "numeroOperacion": "2131234",           ✅ Correcto (string)
  "comprobanteBase64": "data:image...",   ✅ Correcto (string Base64)
  "comprobanteNombre": "integrado.PNG"    ✅ Correcto (string)
}
```

**✅ El payload es 100% correcto según el Swagger.**

**❌ El problema: La suscripción con ID 19 NO EXISTE en la base de datos.**

---

## 🔍 **Análisis del Problema**

### **1. Lo que sucede actualmente:**

1. Usuario se registra con `/api/auth/admin/registro`
2. Backend crea el usuario (ID: 19)
3. Backend **NO crea** un registro en la tabla `suscripcion`
4. JWT token incluye:
   ```json
   {
     "idUsuario": 19,
     "correo": "anghelolerma@gmail.com",
     "tipoUsuario": "ADMIN",
     "estadoSuscripcion": "PENDIENTE_PAGO"
     // ❌ NO incluye idSuscripcion
   }
   ```
5. Usuario intenta cargar comprobante
6. Frontend envía: `idSuscripcion: 19` (usando idUsuario como fallback)
7. Backend busca en tabla `suscripcion` WHERE id = 19
8. **❌ No existe → Error 400**

### **2. Por qué falla:**

- El backend espera que exista un **registro en la tabla `suscripcion`**
- Pero el registro solo crea el **usuario**, no la **suscripción**
- El frontend no puede "inventar" un idSuscripcion válido

---

## ✅ **SOLUCIÓN 1: Crear suscripción en el registro (RECOMENDADO)**

### **Modificar el endpoint de registro:**

**Archivo:** `AuthController.java` o `RegistroService.java`

**Método:** `registrarAdmin()` o `registro()`

**Cambio necesario:**

```java
@PostMapping("/admin/registro")
public ResponseEntity<?> registrarAdmin(@RequestBody RegistroAdminRequest request) {
    // 1. Crear usuario (como ya lo haces)
    Usuario usuario = new Usuario();
    usuario.setNombre(request.getNombre());
    usuario.setCorreo(request.getCorreo());
    // ... resto de campos
    usuario = usuarioRepository.save(usuario);
    
    // 2. ✅ NUEVO: Crear suscripción automáticamente
    Suscripcion suscripcion = new Suscripcion();
    suscripcion.setIdUsuario(usuario.getIdUsuario());
    suscripcion.setTipoPlan(request.getTipoPlan()); // PRUEBA, MENSUAL, etc
    suscripcion.setEstado("PENDIENTE_PAGO");
    suscripcion.setFechaCreacion(LocalDateTime.now());
    
    // Si es plan PRUEBA, activar inmediatamente
    if ("PRUEBA".equals(request.getTipoPlan())) {
        suscripcion.setEstado("ACTIVA");
        suscripcion.setFechaInicio(LocalDate.now());
        suscripcion.setFechaVencimiento(LocalDate.now().plusDays(7));
    }
    
    suscripcion = suscripcionRepository.save(suscripcion);
    
    // 3. ✅ NUEVO: Incluir idSuscripcion en el JWT
    String jwt = jwtUtil.generarToken(
        usuario.getCorreo(),
        usuario.getIdUsuario(),
        usuario.getTipoUsuario(),
        suscripcion.getIdSuscripcion() // ← Agregar este campo
    );
    
    // 4. Retornar respuesta con idSuscripcion
    return ResponseEntity.ok(AuthResponse.builder()
        .token(jwt)
        .idUsuario(usuario.getIdUsuario())
        .idSuscripcion(suscripcion.getIdSuscripcion()) // ← Agregar
        .nombre(usuario.getNombre())
        .correo(usuario.getCorreo())
        .tipoUsuario(usuario.getTipoUsuario())
        .estadoSuscripcion(suscripcion.getEstado())
        .tipoPlan(suscripcion.getTipoPlan())
        .build());
}
```

### **Modificar JWTUtil para incluir idSuscripcion:**

```java
public String generarToken(String correo, Long idUsuario, String tipoUsuario, Long idSuscripcion) {
    Map<String, Object> claims = new HashMap<>();
    claims.put("idUsuario", idUsuario);
    claims.put("tipoUsuario", tipoUsuario);
    claims.put("idSuscripcion", idSuscripcion); // ← NUEVO
    
    return Jwts.builder()
        .setClaims(claims)
        .setSubject(correo)
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 24h
        .signWith(SignatureAlgorithm.HS512, SECRET_KEY)
        .compact();
}
```

---

## ✅ **SOLUCIÓN 2: Aceptar idUsuario en el endpoint de pagos (ALTERNATIVA)**

### **Modificar el endpoint de pagos:**

**Archivo:** `PagoController.java`

**Método:** `registrarComprobante()`

**Cambio necesario:**

```java
@PostMapping("/registrar-comprobante")
public ResponseEntity<?> registrarComprobante(@RequestBody RegistrarComprobanteRequest request) {
    log.info("📥 Recibiendo comprobante...");
    log.info("📦 idSuscripcion recibido: {}", request.getIdSuscripcion());
    
    // ✅ NUEVO: Si no hay suscripción, buscar por usuario
    Suscripcion suscripcion;
    
    if (request.getIdSuscripcion() != null) {
        // Buscar por ID de suscripción (forma normal)
        suscripcion = suscripcionRepository.findById(request.getIdSuscripcion())
            .orElse(null);
    } else {
        // ✅ NUEVO: Buscar por ID de usuario o email
        Usuario usuario = usuarioRepository.findByCorreo(request.getEmail())
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
        // Buscar suscripción del usuario
        suscripcion = suscripcionRepository.findByIdUsuario(usuario.getIdUsuario())
            .orElse(null);
            
        // Si no existe, crearla automáticamente
        if (suscripcion == null) {
            suscripcion = new Suscripcion();
            suscripcion.setIdUsuario(usuario.getIdUsuario());
            suscripcion.setTipoPlan("MENSUAL"); // Por defecto
            suscripcion.setEstado("PENDIENTE_PAGO");
            suscripcion.setFechaCreacion(LocalDateTime.now());
            suscripcion = suscripcionRepository.save(suscripcion);
            
            log.info("✅ Suscripción creada automáticamente: ID {}", suscripcion.getIdSuscripcion());
        }
    }
    
    if (suscripcion == null) {
        return ResponseEntity.badRequest()
            .body(ApiResponse.error("Suscripción no encontrada"));
    }
    
    // ... resto del código para crear el pago
}
```

---

## 📊 **Comparación de Soluciones**

| Aspecto | Solución 1 (Crear en registro) | Solución 2 (Crear en pago) |
|---------|--------------------------------|----------------------------|
| **Complejidad** | Media | Baja |
| **Consistencia** | ✅ Alta (siempre hay suscripción) | ⚠️ Media (se crea tarde) |
| **Riesgo** | Bajo | Medio |
| **Recomendado** | ✅ **SÍ** | No (workaround) |

---

## 🔧 **Pasos para Implementar (Solución 1)**

1. **Modificar el servicio de registro:**
   - Agregar creación de `Suscripcion` después de crear `Usuario`
   - Guardar en `suscripcionRepository.save()`

2. **Modificar JWTUtil:**
   - Agregar `idSuscripcion` a los claims del token
   - Actualizar método `generarToken()`

3. **Modificar AuthResponse:**
   - Agregar campo `idSuscripcion` al DTO de respuesta

4. **Probar:**
   ```bash
   # 1. Registrar nuevo usuario
   POST /api/auth/admin/registro
   {
     "nombre": "Test",
     "correo": "test@test.com",
     "tipoPlan": "MENSUAL"
   }
   
   # 2. Verificar que el JWT incluye idSuscripcion
   # Decodificar token en jwt.io
   
   # 3. Intentar cargar comprobante
   POST /api/pagos/registrar-comprobante
   {
     "idSuscripcion": [ID del token],
     "metodoPago": "YAPE",
     "monto": 49.90,
     ...
   }
   ```

---

## 📝 **Estado Actual del Frontend**

El frontend ya está preparado para:
- ✅ Leer `idSuscripcion` del token JWT
- ✅ Enviarlo en el request de comprobante
- ✅ Mostrar error claro si no existe

**Lo único que falta es que el BACKEND:**
- Cree la suscripción al registrar
- Incluya `idSuscripcion` en el JWT

---

## 🆘 **Solución Temporal (mientras arreglas backend)**

**Para el usuario actual (anghelolerma@gmail.com):**

1. Ejecutar SQL manual:
   ```sql
   INSERT INTO suscripcion (id_usuario, tipo_plan, estado, fecha_creacion)
   VALUES (19, 'MENSUAL', 'PENDIENTE_PAGO', NOW());
   ```

2. Obtener el ID generado (ej: 123)

3. Regenerar el JWT con:
   ```json
   {
     "idUsuario": 19,
     "idSuscripcion": 123,
     "correo": "anghelolerma@gmail.com"
   }
   ```

4. Usuario hace logout y login de nuevo

---

**Fecha:** 30 de Noviembre, 2025  
**Prioridad:** 🔴 **CRÍTICA**  
**Impacto:** Bloquea TODO el flujo de registro y pago
