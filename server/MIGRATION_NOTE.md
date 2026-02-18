# Database Migration Note - Remove Subdomain

## ⚠️ Important: Database Schema Change

Subdomain field telah dihapus dari model. Jika kamu sudah punya data di database, lakukan salah satu:

### Option 1: Drop & Recreate (Development - Data Loss!)
```sql
-- Drop existing tables
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS tenant_settings CASCADE;
DROP TABLE IF EXISTS tenant_users CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

Lalu restart aplikasi, GORM akan auto-migrate schema baru.

### Option 2: Manual Migration (Keep Data)
```sql
-- Remove subdomain column from tenants table
ALTER TABLE tenants DROP COLUMN IF EXISTS subdomain;
```

### Option 3: Fresh Start
```bash
# Drop database dan buat baru
psql -U postgres
DROP DATABASE multitenant_app;
CREATE DATABASE multitenant_app;
\q

# Restart aplikasi untuk auto-migrate
go run cmd/main.go
```

## ✅ After Migration

Test register endpoint tanpa subdomain:
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User",
    "tenant_name": "My Company"
  }'
```

Response tidak akan ada field `subdomain` lagi!
