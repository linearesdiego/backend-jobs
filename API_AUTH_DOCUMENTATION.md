# API Authentication Routes

Base URL: `http://localhost:8000/api`

## Public Endpoints

### 1. Register

**POST** `/register`

Create a new user account.

```json
{
    "name": "John",
    "lastname": "Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "phone": "+1234567890",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip_code": "10001",
    "role": "provider"
}
```

**Response:**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John",
    "lastname": "Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "provider",
    ...
  },
  "access_token": "1|abc123...",
  "token_type": "Bearer"
}
```

### 2. Login

**POST** `/login`

Authenticate and get access token.

```json
{
    "email": "john@example.com",
    "password": "password123"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "user": { ... },
  "access_token": "2|xyz789...",
  "token_type": "Bearer"
}
```

## Protected Endpoints

Include header: `Authorization: Bearer {your_token}`

### 3. Get Current User

**GET** `/me`

Get authenticated user information with related provider/hirer data.

**Response:**

```json
{
  "user": {
    "id": 1,
    "name": "John",
    "email": "john@example.com",
    "provider": { ... },
    "hirer": null
  }
}
```

### 4. Update Profile

**PUT** `/profile`

Update user profile information.

```json
{
    "name": "John Updated",
    "phone": "+9876543210",
    "city": "Los Angeles",
    "profile_picture": "https://example.com/photo.jpg"
}
```

### 5. Change Password

**PUT** `/change-password`

Change user password.

```json
{
    "current_password": "password123",
    "password": "newpassword456",
    "password_confirmation": "newpassword456"
}
```

### 6. Logout

**POST** `/logout`

Revoke current access token.

**Response:**

```json
{
    "message": "Logged out successfully"
}
```

## Testing with cURL

### Register:

```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John",
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123"
  }'
```

### Login:

```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get User (Protected):

```bash
curl -X GET http://localhost:8000/api/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Logout (Protected):

```bash
curl -X POST http://localhost:8000/api/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Available Roles

-   `contratador` (hirer/employer) - Default
-   `proveedor` (provider/service provider)
-   `administrador` (administrator)

## Notes

-   All timestamps are in UTC
-   Tokens don't expire by default (configure in `config/sanctum.php`)
-   Use HTTPS in production
-   Rate limiting is enabled by default (60 requests per minute)
