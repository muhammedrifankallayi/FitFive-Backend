# Shiprocket Authentication API Documentation

## Overview
This API provides authentication functionality for Shiprocket integration, allowing you to login and get an access token for subsequent API calls.

## Base URL
```
http://localhost:3000/api/shiprocket/auth
```

## Endpoints

### Login to Shiprocket
Authenticate with Shiprocket and get an access token along with user information.

**Endpoint:** `POST /api/shiprocket/auth/login`

**Access:** Public

**Request Body:**
```json
{
  "email": "your-shiprocket-email@example.com",
  "password": "your-shiprocket-password"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Shiprocket login successful",
  "data": {
    "company_id": 123456,
    "created_at": "2024-01-15T10:30:00.000Z",
    "email": "your-email@example.com",
    "first_name": "John",
    "id": 789012,
    "last_name": "Doe",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid Shiprocket credentials",
  "statusCode": 401
}
```

**Error Response (422):**
```json
{
  "success": false,
  "message": "Validation error: Invalid email format",
  "statusCode": 422
}
```

**Error Response (503):**
```json
{
  "success": false,
  "message": "Shiprocket service unavailable",
  "statusCode": 503
}
```

---

## Example Usage

### Using curl

**Login:**
```bash
curl -X POST http://localhost:3000/api/shiprocket/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

### Using PowerShell

**Login:**
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/shiprocket/auth/login" `
  -Method Post `
  -ContentType "application/json" `
  -Body (@{
    email = "your-email@example.com"
    password = "your-password"
  } | ConvertTo-Json)

# Extract the token for subsequent API calls
$token = $response.data.token
$companyId = $response.data.company_id
$userName = "$($response.data.first_name) $($response.data.last_name)"

Write-Host "Shiprocket Token: $token"
Write-Host "Company ID: $companyId"
Write-Host "User: $userName"
```

---

## Validation Rules

### Login
- `email`: Required, must be valid email format
- `password`: Required, cannot be empty

---

## Error Handling

The API handles various error scenarios:

**Network/Connection Errors:**
- Returns 503 status with "Unable to connect to Shiprocket service"

**Shiprocket API Errors:**
- 401: Invalid credentials → 401 "Invalid Shiprocket credentials"
- 422: Validation errors → 422 with validation message
- 5xx: Service errors → 503 "Shiprocket service unavailable"

**Request Timeout:**
- 10-second timeout → 503 "Unable to connect to Shiprocket service"

---

## Response Data

The login response includes all user and company information:

- **`token`**: Authentication token for subsequent API calls
- **`company_id`**: Your Shiprocket company identifier
- **`id`**: User ID
- **`email`**: User email address
- **`first_name`** & **`last_name`**: User's name
- **`created_at`**: Account creation timestamp

---

## Security Notes

1. **Token Storage**: Store the Shiprocket token securely
2. **Token Usage**: Include token in Authorization header for Shiprocket API calls: `Authorization: Bearer <token>`
3. **Environment**: Never commit real Shiprocket credentials to version control
4. **HTTPS**: Always use HTTPS in production for API calls
5. **Rate Limiting**: Be aware of Shiprocket's rate limiting policies

---

## Integration Flow

1. **Login** → Get token and user info
2. **Store token** → Save for subsequent Shiprocket API calls
3. **Use token** → Include in Authorization header for Shiprocket API operations:
   - Create shipments
   - Track orders  
   - Generate AWB numbers
   - Access pickup schedules
   - Manage returns

---

## Environment Variables

For production use, consider storing Shiprocket credentials in environment variables:

```env
SHIPROCKET_EMAIL=your-email@example.com
SHIPROCKET_PASSWORD=your-password
```

Then modify your application to use these for automated authentication.

---

## Official Shiprocket API

This endpoint connects to the official Shiprocket API:
- **URL**: `https://apiv2.shiprocket.in/v1/external/auth/login`
- **Method**: POST
- **Content-Type**: application/json

All responses are directly from Shiprocket's authentication service.