Here's a comprehensive README documentation for your authentication API endpoints:

# Authentication API Documentation

## Base URL
`https://your-api-domain.com/api/auth`

## Endpoints

### 1. User Registration
**Endpoint:** `POST /signup`  
**Description:** Register a new user  
**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "role": "customer"
}
```
**Possible Roles:** `customer`, `vendor`, `admin`  
**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "role": "customer",
    "verified": false
  }
}
```

### 2. User Login
**Endpoint:** `POST /login`  
**Description:** Authenticate user and return JWT token  
**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```
**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": "507f1f77bcf86cd799439011",
    "full_name": "John Doe"
  }
}
```

### 3. Google Authentication
**Endpoint:** `POST /google`  
**Description:** Authenticate using Google OAuth  
**Request Body:**
```json
{
  "idToken": "google-oauth-token"
}
```
**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "john.doe@example.com",
      "first_name": "John",
      "last_name": "Doe"
    }
  }
}
```

### 4. Request OTP
**Endpoint:** `POST /request-otp`  
**Description:** Request One-Time Password for verification  
**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```
**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "otp": "1234"
}
```

### 5. Verify OTP
**Endpoint:** `POST /verify-otp`  
**Description:** Verify the OTP code  
**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "otp": "1234"
}
```
**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP verified successfully"
}
```

### 6. Reset Password
**Endpoint:** `POST /reset-password`  
**Description:** Reset user password (after OTP verification)  
**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "new_password": "newSecurePassword123",
  "confirm_password": "newSecurePassword123"
}
```
**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### 7. Change Password
**Endpoint:** `PUT /change-password`  
**Headers:** `Authorization: Bearer <token>`  
**Description:** Change password (requires current password)  
**Request Body:**
```json
{
  "current_password": "oldPassword123",
  "new_password": "newSecurePassword123"
}
```
**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### 8. Resend Verification Email
**Endpoint:** `POST /resend-verification-email`  
**Description:** Resend verification OTP email  
**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```
**Success Response (200):**
```json
{
  "success": true,
  "message": "Verification email resent"
}
```

## Error Responses

### Common Error Responses
- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Invalid credentials
- **404 Not Found**: User not found
- **500 Internal Server Error**: Server error

### Example Error Response
```json
{
  "success": false,
  "error": "User already exists",
  "statusCode": 400
}
```

## Authentication
- Include JWT token in the Authorization header for protected routes:
```
Authorization: Bearer <token>
```

## Rate Limiting
- 100 requests per 15 minutes per IP address

## Notes
- Passwords must be at least 8 characters long
- JWT tokens expire after 360 hours (15 days)
- OTP codes expire after 10 minutes

This documentation provides a complete reference for your authentication API endpoints, including request/response examples and error handling. You can add this to your project's README.md file.