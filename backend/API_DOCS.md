# ISL Backend - API Documentation

## Overview
Backend server for ISL application with JWT authentication and PostgreSQL database integration.

## Setup

### Prerequisites
- Node.js v16+
- PostgreSQL v12+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```env
DB_HOST=localhost
DB_PORT=3133
DB_NAME=demodb
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
PORT=5000
```

3. Start the server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

---

## API Endpoints

### Health Check
```http
GET /health
```
Check if server is running.

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

### Database Check
```http
GET /db-check
```
Test database connection.

**Response:**
```json
{
  "success": true,
  "message": "Database connection successful",
  "timestamp": { "now": "2026-02-10T..." }
}
```

---

## Authentication Endpoints

### Sign Up (Create Account)
```http
POST /api/auth/signup
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400`: Missing fields or passwords don't match
- `409`: Email already registered
- `500`: Server error

---

### Login
```http
POST /api/auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400`: Missing email or password
- `401`: Invalid email or password
- `500`: Server error

---

### Verify Token
```http
POST /api/auth/verify
Content-Type: application/json
```

**Method 1: Token in body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Method 2: Authorization header:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "iat": 1707570000,
    "exp": 1707656400
  }
}
```

**Error Responses:**
- `400`: Token not provided
- `401`: Invalid or expired token
- `500`: Verification error

---

## Users Endpoints

### Get All Users
```http
GET /api/users
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    }
  ]
}
```

### Get User by ID
```http
GET /api/users/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "password": "...",
    "password_hash": "..."
  }
}
```

---

## Testing with cURL

### Sign Up
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Verify Token (using body)
```bash
curl -X POST http://localhost:5000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_JWT_TOKEN_HERE"
  }'
```

### Verify Token (using Bearer header)
```bash
curl -X POST http://localhost:5000/api/auth/verify \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## Database Schema

### userinfo Table
```sql
CREATE TABLE userinfo (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200),
  email VARCHAR(200),
  phone VARCHAR(15),
  password VARCHAR(15),
  password_hash VARCHAR(255)
);
```

---

## Security Notes

1. **JWT Secret**: Change `JWT_SECRET` in `.env` to a strong, unique value in production
2. **Passwords**: Never store plain passwords - always use `bcrypt` hashing
3. **HTTPS**: Use HTTPS in production for all API requests
4. **CORS**: Currently allows all origins - restrict in production
5. **Token Expiration**: JWTs expire after 24 hours

---

## Troubleshooting

### JWT Token Not Validating
1. Ensure `JWT_SECRET` in `.env` is correctly set
2. Check token hasn't expired (24h validity)
3. Verify token format in request (Bearer prefix if using header)
4. Check console logs for detailed error messages

### Database Connection Failed
1. Verify PostgreSQL is running on correct port
2. Check DB credentials in `.env`
3. Ensure `demodb` database exists
4. Check user permissions

### Port Already in Use
```bash
# Kill process on port 5000
ps aux | grep node
kill -9 <PID>
```

---

## Build for Production
```bash
npm run build
npm start
```

---

## License
ISC
