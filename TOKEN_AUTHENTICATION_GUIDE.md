# Token Authentication Implementation Guide

## Overview

This application implements a secure JWT-based authentication system with both **Access Tokens** and **Refresh Tokens** to provide enhanced security and better user experience.

## Architecture

### Token Types

1. **Access Token**
   - **Purpose**: Used for authenticating API requests
   - **Lifetime**: 15 minutes (short-lived)
   - **Storage**: Frontend localStorage
   - **Included in**: Authorization header of all protected API requests

2. **Refresh Token**
   - **Purpose**: Used to obtain new access tokens when they expire
   - **Lifetime**: 7 days (long-lived)
   - **Storage**: 
     - Frontend: localStorage
     - Backend: User document in database
   - **Security**: One-time use, invalidated on logout

## How It Works

### 1. Login Flow

```
User -> Login Request -> Backend
                          |
                          v
                    Validate Credentials
                          |
                          v
                Generate Access Token (15min)
                Generate Refresh Token (7d)
                          |
                          v
                Store Refresh Token in DB
                          |
                          v
                Return Both Tokens -> Frontend
                                       |
                                       v
                              Store in localStorage
```

### 2. API Request Flow

```
Frontend -> API Request + Access Token -> Backend
                                           |
                                           v
                                    Validate Token
                                           |
                        +------------------+------------------+
                        |                                     |
                    Valid Token                          Invalid/Expired
                        |                                     |
                        v                                     v
                Process Request                        Return 401 Error
                        |                                     |
                        v                                     v
                Return Response                         Frontend Intercepts
                                                              |
                                                              v
                                                    Attempt Token Refresh
```

### 3. Token Refresh Flow

```
Frontend Detects 401 -> Refresh Token Request -> Backend
                                                   |
                                                   v
                                          Validate Refresh Token
                                                   |
                                +------------------+------------------+
                                |                                     |
                            Valid Token                          Invalid/Expired
                                |                                     |
                                v                                     v
                    Generate New Access Token              Logout User (clear tokens)
                                |                                     |
                                v                                     v
                    Return New Access Token               Redirect to Login
                                |
                                v
                    Store New Token & Retry Request
```

### 4. Logout Flow

```
User Clicks Logout -> Logout Request (with access token) -> Backend
                                                              |
                                                              v
                                                    Invalidate Refresh Token
                                                    (Remove from DB)
                                                              |
                                                              v
                                                    Return Success -> Frontend
                                                                       |
                                                                       v
                                                              Clear All Tokens
                                                              Redirect to Login
```

## Backend Implementation

### Environment Variables

```env
# Access Token (short-lived)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
JWT_EXPIRE=15m

# Refresh Token (long-lived)
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production-67890
JWT_REFRESH_EXPIRE=7d
```

### API Endpoints

#### 1. Login
```
POST /api/auth/login
Body: { email, password }
Response: {
  success: true,
  token: "access_token",
  refreshToken: "refresh_token",
  user: { ... }
}
```

#### 2. Refresh Token
```
POST /api/auth/refresh
Body: { refreshToken: "refresh_token" }
Response: {
  success: true,
  data: { token: "new_access_token" }
}
```

#### 3. Logout
```
POST /api/auth/logout
Headers: { Authorization: "Bearer access_token" }
Response: {
  success: true,
  message: "Logged out successfully"
}
```

### Database Schema

User model includes:
```typescript
{
  refreshToken: String (stored hashed),
  refreshTokenExpiry: Date
}
```

### Middleware

The `protect` middleware:
1. Extracts access token from Authorization header
2. Verifies token signature and expiration
3. Fetches user from database
4. Attaches user to request object
5. Returns 401 if token is invalid/expired

## Frontend Implementation

### Auth Service Methods

```typescript
// Login and store tokens
login(credentials)

// Logout and clear tokens
logout()

// Logout locally without API call
logoutLocally()

// Refresh access token
refreshToken()

// Get current access token
getAccessToken()

// Get refresh token
getRefreshToken()

// Check authentication status
isAuthenticated()
```

### HTTP Interceptor

The `AuthInterceptor`:
1. Adds access token to all API requests (except login/register)
2. Intercepts 401 responses
3. Automatically attempts token refresh
4. Retries failed request with new token
5. Logs out user if refresh fails

### Auth Guard

The `AuthGuard`:
1. Checks if user has valid tokens
2. Allows access to protected routes
3. Redirects to login if not authenticated
4. Preserves return URL for post-login redirect

## Security Features

### 1. Token Rotation
- Access tokens expire every 15 minutes
- Forces regular token refresh
- Minimizes damage if token is compromised

### 2. Refresh Token Validation
- Stored in database for validation
- Invalidated on logout
- One-time use per refresh attempt

### 3. Automatic Logout
- User logged out when refresh token expires
- User logged out when refresh fails
- Clear all client-side storage

### 4. Secure Storage
- Tokens stored in localStorage (consider httpOnly cookies for production)
- Refresh token hashed in database
- Separate secrets for access and refresh tokens

### 5. Error Handling
- Graceful handling of expired tokens
- Automatic token refresh on 401 errors
- User-friendly error messages

## Testing the Implementation

### 1. Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"secureAdminPass123"}'
```

### 2. Test Protected Endpoint
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Test Token Refresh
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```

### 4. Test Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Best Practices

### 1. Production Security
- Use strong, unique secrets for JWT_SECRET and JWT_REFRESH_SECRET
- Consider using httpOnly cookies for tokens instead of localStorage
- Implement CSRF protection if using cookies
- Use HTTPS in production

### 2. Token Expiration
- Keep access tokens short-lived (15-30 minutes)
- Keep refresh tokens longer (7-30 days)
- Adjust based on your security requirements

### 3. Token Storage
- Frontend: Consider httpOnly cookies instead of localStorage
- Backend: Hash refresh tokens before storing
- Never log or expose tokens in error messages

### 4. Error Handling
- Always clear tokens on authentication errors
- Provide clear feedback to users
- Log authentication failures for security monitoring

### 5. Testing
- Test token expiration scenarios
- Test concurrent refresh attempts
- Test logout from multiple devices
- Test invalid token scenarios

## Troubleshooting

### Issue: 401 Errors After 15 Minutes
**Solution**: Check that the token refresh mechanism is working. Verify interceptor is correctly configured.

### Issue: Infinite Refresh Loop
**Solution**: Ensure refresh endpoint is excluded from interceptor. Check that new token is properly stored.

### Issue: User Not Logged Out After Token Expires
**Solution**: Verify refresh token expiration is set correctly. Check that logout is called when refresh fails.

### Issue: Tokens Not Being Sent with Requests
**Solution**: Check interceptor registration in app.config.ts. Verify Authorization header is being added.

## Migration from Old System

If upgrading from single-token system:

1. Update `.env` with new JWT_REFRESH_SECRET and JWT_REFRESH_EXPIRE
2. Run migration to add refreshToken and refreshTokenExpiry fields to User model
3. Update frontend to use new AuthService methods
4. Test thoroughly before deploying
5. Force re-login for all users after deployment

## Additional Resources

- [JWT.io](https://jwt.io/) - JWT Decoder and Documentation
- [OWASP JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [Angular HTTP Interceptors](https://angular.io/guide/http-interceptor-use-cases)
