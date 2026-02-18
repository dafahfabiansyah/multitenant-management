# 📚 API Documentation - Multi-Tenant Management System

## Base URL
```
http://localhost:8080/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Endpoints

### 1. Register (Create User & Tenant)
Creates a new user account and their first tenant organization.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "admin@company.com",
  "password": "SecurePass123",
  "full_name": "John Doe",
  "tenant_name": "Company Inc"
}
```

**Response (201 Created):**
```json
{
  "message": "Registration successful",
  "user": {
    "id": 1,
    "email": "admin@company.com",
    "full_name": "John Doe",
    "is_active": true,
    "created_at": "2026-02-18T10:00:00Z"
  },
  "tenant": {
    "id": 1,
    "name": "Company Inc",
    "status": "active",
    "created_at": "2026-02-18T10:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 2. Login
Authenticates user and returns JWT token with tenant context.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "admin@company.com",
  "password": "SecurePass123",
  "tenant_id": 1  // Optional: specify if user belongs to multiple tenants
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "admin@company.com",
    "full_name": "John Doe",
    "is_active": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tenant_id": 1,
  "role": "admin",
  "available_tenants": [
    {
      "id": 1,
      "tenant_id": 1,
      "user_id": 1,
      "role": "admin",
      "tenant": {
        "id": 1,
        "name": "Company Inc",
        "subdomain": "company"
      }
    }
  ]
}
```

---

### 3. Get My Tenants
Returns all tenants the authenticated user belongs to.

**Endpoint:** `GET /tenants/my`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "tenants": [
    {
      "id": 1,
      "tenant_id": 1,
      "user_id": 1,
      "role": "admin",
      "tenant": {
        "id": 1,
        "name": "Company Inc",
        "status": "active"
      }
    },
    {
      "id": 2,
      "tenant_id": 2,
      "user_id": 1,
      "role": "member",
      "tenant": {
        "id": 2,
        "name": "Another Org",
        "status": "active"
      }
    }
  ]
}
```

---

### 4. Switch Tenant
Generates a new JWT token for a different tenant context.

**Endpoint:** `POST /tenants/switch/:tenant_id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Tenant switched successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tenant_id": 2,
  "role": "member"
}
```

---

## 🏢 Tenant Management Endpoints

### 5. Get Current Tenant Info
Returns information about the tenant in current JWT context.

**Endpoint:** `GET /tenant`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "tenant": {
    "id": 1,
    "name": "Company Inc",
    "status": "active",
    "created_at": "2026-02-18T10:00:00Z",
    "updated_at": "2026-02-18T10:00:00Z"
  }
}
```

---

### 6. Update Tenant
Updates tenant information (Admin only).

**Endpoint:** `PUT /tenant`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Company Inc - Updated",
  "status": "active"  // Options: active, suspended, inactive
}
```

**Response (200 OK):**
```json
{
  "message": "Tenant updated successfully",
  "tenant": {
    "id": 1,
    "name": "Company Inc - Updated",
    "status": "active",
    "updated_at": "2026-02-18T11:00:00Z"
  }
}
```

---

### 7. Get Tenant Users
Returns all users in the tenant (Admin/Manager only).

**Endpoint:** `GET /tenant/users?page=1&page_size=20`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional, default: 1)
- `page_size` (optional, default: 10, max: 100)

**Response (200 OK):**
```json
{
  "users": [
    {
      "id": 1,
      "tenant_id": 1,
      "user_id": 1,
      "role": "admin",
      "created_at": "2026-02-18T10:00:00Z",
      "user": {
        "id": 1,
        "email": "admin@company.com",
        "full_name": "John Doe",
        "is_active": true
      }
    },
    {
      "id": 2,
      "tenant_id": 1,
      "user_id": 2,
      "role": "member",
      "user": {
        "id": 2,
        "email": "user@company.com",
        "full_name": "Jane Smith"
      }
    }
  ],
  "total": 15,
  "page": 1,
  "page_size": 20
}
```

---

### 8. Update User Role
Updates a user's role in the tenant (Admin only).

**Endpoint:** `PUT /tenant/users/:user_id/role`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "role": "manager"  // Options: admin, manager, member
}
```

**Response (200 OK):**
```json
{
  "message": "User role updated successfully"
}
```

---

### 9. Remove User from Tenant
Removes a user from the tenant (Admin only).

**Endpoint:** `DELETE /tenant/users/:user_id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "User removed successfully"
}
```

---

### 10. Get Audit Logs
Returns audit logs for the tenant (Admin only).

**Endpoint:** `GET /tenant/audit-logs?page=1&page_size=20`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional, default: 1)
- `page_size` (optional, default: 20, max: 100)

**Response (200 OK):**
```json
{
  "logs": [
    {
      "id": 1,
      "tenant_id": 1,
      "user_id": 1,
      "action": "update_role",
      "resource": "user",
      "resource_id": 2,
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2026-02-18T10:30:00Z"
    },
    {
      "id": 2,
      "tenant_id": 1,
      "user_id": 1,
      "action": "remove",
      "resource": "user",
      "resource_id": 3,
      "ip_address": "192.168.1.100",
      "created_at": "2026-02-18T10:25:00Z"
    }
  ],
  "total": 45,
  "page": 1,
  "page_size": 20
}
```

---

## 🔑 Role Hierarchy

| Role | Permissions |
|------|-------------|
| **admin** | Full access to all tenant operations |
| **manager** | Can view users, limited management access |
| **member** | Basic access to tenant data |

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request format or validation failed"
}
```

### 401 Unauthorized
```json
{
  "error": "Missing or invalid authorization header"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error occurred"
}
```

---

## 🧪 Testing with cURL

### Example: Full Registration & Login Flow

```bash
# 1. Register
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User",
    "tenant_name": "Test Company",
    "subdomain": "testco"
  }'

# Save the token from response

# 2. Get tenant info
curl -X GET http://localhost:8080/api/v1/tenant \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 3. Get tenant users (admin only)
curl -X GET "http://localhost:8080/api/v1/tenant/users?page=1&page_size=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 4. Get audit logs
curl -X GET "http://localhost:8080/api/v1/tenant/audit-logs?page=1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔒 Security Notes

1. **JWT Expiry:** Tokens expire after 24 hours (configurable in `.env`)
2. **Tenant Isolation:** All queries automatically filtered by `tenant_id` from JWT
3. **RBAC:** Role-based middleware ensures proper authorization
4. **Audit Logging:** All sensitive actions are automatically logged
5. **Password Hashing:** Bcrypt with default cost (10 rounds)
6. **Connection Pooling:** Optimal settings prevent connection exhaustion

---

## 📊 Performance Tips

1. **Use Pagination:** Always use `page` and `page_size` parameters for list endpoints
2. **Cache Tokens:** JWT tokens are valid for 24h, cache them client-side
3. **Indexed Queries:** Email, subdomain, and tenant_id lookups are highly optimized
4. **Batch Operations:** When adding multiple users, consider implementing batch endpoints

---

## 🚀 Next: Extending for CRM/POS

Struktur ini sudah siap untuk module baru:

```go
// Example: Customer model untuk CRM
type Customer struct {
    ID        uint
    TenantID  uint  // Automatic isolation!
    Name      string
    Email     string
    Phone     string
    // ... fields lainnya
}

// Query dengan automatic tenant filtering
customers := []model.Customer{}
db.Scopes(model.TenantScope(tenantID)).Find(&customers)
```

Semua pattern (repository, service, handler, audit) tinggal di-replicate untuk module baru! 🎉
