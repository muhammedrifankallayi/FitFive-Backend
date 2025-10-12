# Authentication API Documentation

## Overview
This API provides user authentication using JWT (JSON Web Tokens) for secure access to protected resources.

## Base URL
```
http://localhost:3000/api/auth
```

## Authentication Flow
1. Register a new user or login with existing credentials
2. Receive JWT token in response
3. Include token in Authorization header for protected endpoints: `Authorization: Bearer <token>`

## Endpoints

### 1. Register User
Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Access:** Public

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"  // optional: "user" (default) or "admin"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isActive": true,
    "avatar": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "User already exists with this email",
  "statusCode": 400
}
```

### 2. Login
Authenticate and receive access token.

**Endpoint:** `POST /api/auth/login`

**Access:** Public

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isActive": true,
    "avatar": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid credentials",
  "statusCode": 401
}
```

### 3. Get Current User Profile
Retrieve the authenticated user's profile.

**Endpoint:** `GET /api/auth/me`

**Access:** Private (Requires Authentication)

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isActive": true,
    "avatar": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 4. Update Profile
Update the authenticated user's profile information.

**Endpoint:** `PUT /api/auth/me`

**Access:** Private (Requires Authentication)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Jane Doe",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Jane Doe",
    "email": "john@example.com",
    "role": "user",
    "isActive": true,
    "avatar": "https://example.com/avatar.jpg",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:45:00.000Z"
  }
}
```

### 5. Change Password
Change the authenticated user's password.

**Endpoint:** `PUT /api/auth/change-password`

**Access:** Private (Requires Authentication)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "password123",
  "newPassword": "newPassword456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Current password is incorrect",
  "statusCode": 401
}
```

### 6. Get All Users (Admin Only)
Retrieve a list of all registered users.

**Endpoint:** `GET /api/auth/users`

**Access:** Private/Admin (Requires Authentication and Admin Role)

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Retrieved 10 users",
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "isActive": true,
      "avatar": null,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    ...
  ]
}
```

**Error Response (403):**
```json
{
  "success": false,
  "message": "You do not have permission to perform this action",
  "statusCode": 403
}
```

## Validation Rules

### Registration
- **name**: Required, 2-100 characters
- **email**: Required, valid email format
- **password**: Required, minimum 6 characters
- **role**: Optional, must be "user" or "admin"

### Login
- **email**: Required, valid email format
- **password**: Required

### Update Profile
- **name**: Optional, 2-100 characters if provided
- **avatar**: Optional, must be valid URL if provided

### Change Password
- **currentPassword**: Required
- **newPassword**: Required, minimum 6 characters

## Error Responses

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error message describing what went wrong",
  "statusCode": 400
}
```

### Common Error Status Codes
- `400` - Bad Request (validation errors, malformed data)
- `401` - Unauthorized (invalid credentials, expired token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (user not found)
- `500` - Internal Server Error

## JWT Token

The JWT token contains the following payload:
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "john@example.com",
  "role": "user",
  "iat": 1705317000,
  "exp": 1705403400
}
```

**Token Expiration:** Configurable via `JWT_EXPIRE` environment variable (default: 24h)

## Security Notes

1. Always use HTTPS in production
2. Store JWT tokens securely (httpOnly cookies recommended)
3. Never commit `.env` file with real credentials
4. Passwords are hashed using bcrypt before storage
5. Tokens are verified on every protected route
6. Inactive users cannot login

## Example Usage

### Using curl

**Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Get Profile:**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using PowerShell (Windows)

**Register:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" `
  -Method Post `
  -ContentType "application/json" `
  -Body (@{
    name = "John Doe"
    email = "john@example.com"
    password = "password123"
  } | ConvertTo-Json)
```

**Login:**
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
  -Method Post `
  -ContentType "application/json" `
  -Body (@{
    email = "john@example.com"
    password = "password123"
  } | ConvertTo-Json)

$token = $response.token
```

**Get Profile:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/me" `
  -Method Get `
  -Headers @{ Authorization = "Bearer $token" }
```

## Environment Variables

Make sure these are set in your `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/vestra
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=24h
```
