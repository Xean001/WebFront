# 🔧 Solución de Problemas - Fadely Barbershop

## Error 403 (Forbidden) al Crear Barbería

### ❌ Problema
```
POST https://api.fadely.me/api/barberias 403 (Forbidden)
Error al crear organización: HttpErrorResponse {status: 403}
```

### 🔍 Causa
El usuario está intentando crear una barbería sin permisos de **ADMIN**. Solo usuarios registrados como Administrador con el rol correcto pueden crear barberías.

---

## ✅ Solución

### Paso 1: Elimina la sesión anterior
1. Abre las DevTools (`F12` o `Ctrl+Shift+K`)
2. Ve a **Application → Local Storage**
3. Busca `auth_token` y `auth_user` 
4. Elimina ambos
5. Recarga la página (`Ctrl+R`)

### Paso 2: Regístrate como ADMINISTRADOR
1. **NO uses** `/auth/register` (ese es para clientes normales)
2. **USA**: `/auth/register-admin` ← Este es el correcto

   O ve a: **http://localhost:4200/auth/register-admin**

### Paso 3: Completa el formulario de registro
- Nombre *
- Apellido *
- Correo *
- Teléfono * (7-15 dígitos)
- Contraseña * (mínimo 8 caracteres)
- Confirmar Contraseña *
- Fecha de Nacimiento *
- Género *

### Paso 4: Después del registro
- Serás redirigido automáticamente al **Onboarding**
- Ahora **SÍ** deberías poder crear la barbería sin error 403

---

## 📋 Verificación

### ¿Estoy registrado correctamente como ADMIN?
Abre DevTools → **Application → Local Storage → auth_user**

Deberías ver algo como:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "tipoUsuario": "ADMIN",  ← ⭐ IMPORTANTE: Debe ser ADMIN
  "idUsuario": 1,
  "nombre": "Tu Nombre",
  "correo": "tu@email.com",
  "idBarberia": null  ← Será llenado después del onboarding
}
```

**Si `tipoUsuario` NO es `ADMIN`**, hay un problema en el backend. Contacta al equipo de desarrollo.

---

## 🚀 Flujo Correcto

```
START
  ↓
/auth/register-admin  ← Registro de ADMINISTRADOR
  ↓
Backend asigna rol: ADMIN ✓
  ↓
/auth/onboarding  ← Crear la barbería
  ↓
POST /api/barberias  ← Ahora SÍ funciona (403 NO debe ocurrir)
  ↓
/barberias/administrar  ← Dashboard de administración
  ↓
SUCCESS ✅
```

---

## 🛠️ Checklist de Debugging

- [ ] ¿Usaste `/auth/register-admin` y no `/auth/register`?
- [ ] ¿El token está en LocalStorage?
- [ ] ¿`tipoUsuario` en auth_user es "ADMIN"?
- [ ] ¿El backend está ejecutándose en `api.fadely.me`?
- [ ] ¿Tiene acceso a internet o hay problemas de conectividad?

---

## 📞 Errores Comunes

### Error 401 (Unauthorized)
**Causa**: Token expirado o no válido
**Solución**: 
1. Limpia LocalStorage (auth_token y auth_user)
2. Vuelve a iniciar sesión

### Error 400 (Bad Request)
**Causa**: Datos del formulario inválidos
**Solución**: 
- Verifica que todos los campos estén completos
- Valida que el RUC tenga exactamente 11 dígitos
- Revisa que el teléfono tenga 7-15 dígitos

### Error 500 (Server Error)
**Causa**: Problema en el servidor backend
**Solución**: 
- Verifica que el backend esté ejecutándose
- Revisa los logs del servidor
- Contacta al equipo de desarrollo

---

## 📝 Notas Importantes

1. **Tipo de Usuario**: El backend debe asignar automáticamente el rol `ADMIN` al usar `/auth/admin/crear`
2. **Token JWT**: Se envía automáticamente en el header `Authorization: Bearer <token>`
3. **Interceptor**: El auth.interceptor.ts maneja automáticamente el envío del token
4. **Guardias**: El authGuard protege las rutas que requieren autenticación

---

## 🔗 Rutas Relacionadas

- **Registro de Cliente**: `/auth/register`
- **Registro de Admin**: `/auth/register-admin` ← USA ESTA
- **Login**: `/auth/login`
- **Onboarding**: `/auth/onboarding`
- **Dashboard Admin**: `/barberias/administrar`

---

**Última actualización**: 30 de Noviembre de 2025
**Versión**: 1.0
