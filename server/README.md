# Multi-Tenant Management System API

## 🚀 Overview
Sistem management multi-tenant yang aman dengan Golang, Gin, GORM, dan PostgreSQL. Dilengkapi dengan:
- ✅ Connection pooling yang optimal
- ✅ Query optimization dengan indexing
- ✅ JWT authentication dengan tenant context
- ✅ Role-based access control (RBAC)
- ✅ Audit logging
- ✅ Automatic tenant data isolation

## 📋 Prerequisites
- Go 1.24+
- PostgreSQL 13+

## 🛠️ Installation

1. **Clone & Install Dependencies**
```bash
cd "d:\MyProgram\multitenant management system\server"
go mod download
```

2. **Setup PostgreSQL Database**
```sql
CREATE DATABASE multitenant_app;
```

3. **Configure Environment**
Copy `.env.example` to `.env` and update your database credentials:
```bash
cp .env.example .env
```

4. **Run Application**
```bash
go run cmd/main.go
```

Server will start on `http://localhost:8080`

## 📚 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user & create tenant |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/tenants/my` | Get all tenants for current user |
| POST | `/api/tenants/switch/:tenant_id` | Switch to different tenant |

### Tenant Management (Protected)
| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| GET | `/api/tenant` | Get current tenant info | Any |
| PUT | `/api/tenant` | Update tenant | Admin |
| GET | `/api/tenant/users` | Get tenant users | Admin/Manager |
| PUT | `/api/tenant/users/:user_id/role` | Update user role | Admin |
| DELETE | `/api/tenant/users/:user_id` | Remove user | Admin |
| GET | `/api/tenant/audit-logs` | Get audit logs | Admin |

## 🔐 Security Features

### 1. **Tenant Data Isolation**
- Automatic `tenant_id` filtering via GORM scopes
- JWT contains tenant context
- Middleware validates tenant access

### 2. **Query Optimization**
- Composite indexes on `(tenant_id, user_id)`
- Indexed fields: `email`, `status`, `is_active`
- Connection pooling (25 max open, 5 idle)
- Prepared statements enabled

### 3. **Authentication**
- JWT with HS256 signing
- 24-hour token expiry
- Role-based permissions (admin, manager, member)

### 4. **Audit Logging**
- All sensitive actions logged
- Includes user, action, resource, IP, user agent

## 📝 Example Requests

### Register
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "secure123",
    "full_name": "John Doe",
    "tenant_name": "Company Inc"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "secure123"
  }'
```

### Get Tenant Info (with JWT)
```bash
curl -X GET http://localhost:8080/api/tenant \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🏗️ Database Schema

### Core Tables
- `tenants` - Tenant/organization data
- `users` - User accounts
- `tenant_users` - Many-to-many with roles
- `tenant_settings` - Key-value settings per tenant
- `audit_logs` - Security audit trail

### Indexes (for performance)
- `tenants.subdomain` (unique)
- `users.email` (unique)
- `tenant_users.(tenant_id, user_id)` (composite)
- `audit_logs.tenant_id`
- `audit_logs.created_at`

## 🚀 Performance Tips

1. **Connection Pooling** - Already configured optimally
2. **Pagination** - Use `?page=1&page_size=20` on list endpoints
3. **Preloading** - Relationships auto-preloaded where needed
4. **Prepared Statements** - Enabled by default

## 🔮 Next Steps (for CRM & POS)

Struktur ini sudah siap untuk dikembangkan:
- ✅ Add `customers`, `products`, `orders` models dengan `tenant_id`
- ✅ Use existing GORM scopes untuk automatic filtering
- ✅ Repository pattern sudah scalable
- ✅ Audit logging untuk semua transaksi
- ✅ Service layer untuk business logic

## 📄 License
MIT
