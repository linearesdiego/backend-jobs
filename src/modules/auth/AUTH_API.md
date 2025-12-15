# API de Autenticación

## Rutas Públicas

### Registro

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "Password123",
  "role": "CONTRATADOR"
}
```

**Respuesta:**

```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "role": "..." },
    "token": "...",
    "refreshToken": "..."
  }
}
```

### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "Password123"
}
```

### Renovar Token

```http
POST /api/v1/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "tu-refresh-token-aquí"
}
```

## Rutas Protegidas

> Requieren header: `Authorization: Bearer {token}`

### Obtener Usuario Actual

```http
GET /api/v1/auth/me
Authorization: Bearer {tu-token}
```

### Cambiar Contraseña

```http
POST /api/v1/auth/change-password
Authorization: Bearer {tu-token}
Content-Type: application/json

{
  "currentPassword": "Password123",
  "newPassword": "NewPassword456"
}
```

## Validaciones

### Contraseña

- Mínimo 6 caracteres
- Al menos una mayúscula
- Al menos una minúscula
- Al menos un número

### Roles permitidos

- `CONTRATADOR`
- `PROVEEDOR`
- `ADMIN`

## Errores Comunes

```json
{
  "success": false,
  "message": "Descripción del error",
  "error": "CODIGO_ERROR"
}
```

**Códigos:**

- `400` - Error de validación
- `401` - No autorizado / Credenciales inválidas
- `404` - Recurso no encontrado
- `409` - Conflicto (ej: email ya registrado)
- `500` - Error interno del servidor
