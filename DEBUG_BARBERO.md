# 🔍 DEBUG: Por qué el Barbero no puede acceder a Horarios

## Paso 1: Verificar datos en localStorage

Abre la **Consola del Navegador** (F12) y ejecuta:

```javascript
// Ver el usuario actual
const user = JSON.parse(localStorage.getItem('auth_user'));
console.log('👤 Usuario actual:', user);
console.log('📋 Tipo Usuario:', user?.tipoUsuario);
console.log('🏢 ID Barbería:', user?.idBarberia);
console.log('💳 Estado Suscripción:', user?.estadoSuscripcion);
```

## Paso 2: Verificar qué valores tiene el barbero

**Esperado para BARBERO:**
```json
{
  "tipoUsuario": "BARBERO",
  "idBarberia": 1,  // ← DEBE tener un número aquí
  "estadoSuscripcion": null // o undefined
}
```

## Paso 3: Diagnóstico

### ❌ Si `idBarberia` es `null` o `undefined`:
**PROBLEMA:** El barbero no tiene barbería asignada en el backend.

**SOLUCIÓN:** Necesitas que el ADMIN asigne el barbero a una barbería.

### ❌ Si `tipoUsuario` NO es "BARBERO":
**PROBLEMA:** El usuario no tiene el rol correcto.

**SOLUCIÓN:** Verificar en el backend que el usuario tenga `tipo_usuario = 'BARBERO'`.

### ✅ Si tiene ambos valores correctos pero sigue fallando:
**PROBLEMA:** Angular no recompiló los cambios.

**SOLUCIÓN:** 
1. Detener el servidor (Ctrl+C)
2. Limpiar caché: `npm run build -- --delete-output-path`
3. Reiniciar: `npm start`

## Paso 4: Ver logs del guard en tiempo real

Cuando intentes acceder a `/horarios/administrar`, deberías ver en consola:

```
subscriptionGuard - Verificando suscripción para: /horarios/administrar
subscriptionGuard - isAuthenticated(): true
subscriptionGuard - Usuario actual (localStorage): { ... }
```

**Si ves esto:**
```
subscriptionGuard - Empleado con barbería asignada, permitiendo acceso
```
✅ **FUNCIONA** - El guard está dejando pasar al barbero.

**Si NO ves ese mensaje:**
❌ **PROBLEMA** - El barbero no tiene `idBarberia` o no es tipo "BARBERO".

## Paso 5: Solución Temporal (mientras debugueas)

Si necesitas acceso inmediato, puedes modificar temporalmente el guard:

```typescript
// En subscription.guard.ts, línea 25-29
// TEMPORAL: Permitir a TODOS los barberos
if (user?.tipoUsuario === 'BARBERO') {
  console.log('subscriptionGuard - BARBERO detectado, permitiendo acceso (TEMPORAL)');
  return true;
}
```

## Paso 6: Verificar en el Backend

Si el problema persiste, verifica en el backend:

**Endpoint:** `GET /api/auth/verificar-estado`

Con el token del barbero, debería devolver algo como:
```json
{
  "success": true,
  "data": {
    "idUsuario": 123,
    "tipoUsuario": "BARBERO",
    "idBarberia": 1,  // ← Importante
    "estadoSuscripcion": null
  }
}
```

Si `idBarberia` es `null`, el barbero NO está asignado a ninguna barbería.

## 🎯 Acción Inmediata

**Ejecuta esto en la consola del navegador AHORA:**

```javascript
const user = JSON.parse(localStorage.getItem('auth_user'));
console.table({
  'Tipo Usuario': user?.tipoUsuario,
  'ID Barbería': user?.idBarberia,
  'Estado Suscripción': user?.estadoSuscripcion,
  'Nombre': user?.nombre,
  'Email': user?.correo
});
```

**Copia el resultado y dime qué valores ves.**
