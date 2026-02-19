# 🧪 Testing Pipeline Endpoints

## Langkah-langkah Test Pipeline:

### 1️⃣ Login dulu untuk dapat token

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {...}
}
```

**SIMPAN TOKEN INI!** 📝

---

### 2️⃣ Get Pipeline Stages (Auto-create 6 default stages)

```bash
curl -X GET http://localhost:8080/api/pipeline/stages \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**✅ Endpoint yang benar:** `http://localhost:8080/api/pipeline/stages`
**❌ Bukan:** `http://localhost:8080/pipeline/stages` (missing `/api`)

**Response pertama kali (auto-create 6 stages):**
```json
{
  "stages": [
    {
      "id": 1,
      "name": "Lead",
      "order": 1,
      "probability": 10,
      "color": "#3B82F6",
      "is_default": true,
      "is_closed_won": false,
      "is_closed_lost": false
    },
    {
      "id": 2,
      "name": "Qualified",
      "order": 2,
      "probability": 25,
      "color": "#06B6D4"
    },
    ...
  ],
  "total": 6
}
```

---

### 3️⃣ Create Custom Stage

```bash
curl -X POST http://localhost:8080/api/pipeline/stages \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Demo Scheduled",
    "order": 3,
    "probability": 35,
    "color": "#8B5CF6"
  }'
```

---

### 4️⃣ Create Deal

```bash
curl -X POST http://localhost:8080/api/deals \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Enterprise Software Deal",
    "description": "Big client opportunity",
    "value": 50000000,
    "currency": "IDR",
    "contact_id": 1,
    "stage_id": 1,
    "source": "referral",
    "tags": ["enterprise", "high-value"]
  }'
```

---

### 5️⃣ Get All Deals

```bash
curl -X GET http://localhost:8080/api/deals \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## ⚠️ Common Errors & Solutions:

### Error 404: "Not Found"

**Penyebab:**
1. ❌ Endpoint path salah
2. ❌ Missing `/api` prefix
3. ❌ Server belum running

**Solusi:**
```bash
# BENAR ✅
http://localhost:8080/api/pipeline/stages

# SALAH ❌
http://localhost:8080/pipeline/stages
```

---

### Error 401: "Missing or invalid authorization header"

**Penyebab:** Token JWT tidak ada atau salah

**Solusi:**
1. Login dulu untuk dapat token
2. Pastikan header: `Authorization: Bearer <token>`
3. Token belum expired (valid 24 jam)

---

### Error 403: "Tenant context required"

**Penyebab:** JWT token tidak ada `tenant_id`

**Solusi:**
1. Pastikan login dengan user yang sudah punya tenant
2. Atau register baru (auto create tenant)

---

## 📋 Quick Test Checklist:

- [ ] Server running di port 8080
- [ ] Database sudah migrate (otomatis saat server start)
- [ ] Sudah register/login dan dapat token
- [ ] Token disimpan untuk request berikutnya
- [ ] Endpoint pakai prefix `/api`
- [ ] Header `Authorization: Bearer <token>` ada di setiap request

---

## 🚀 Test dengan Postman/Thunder Client:

### Collection Structure:

```
Pipeline Testing/
├── 1. Auth/
│   ├── Register
│   └── Login (save token to environment)
├── 2. Pipeline Stages/
│   ├── GET All Stages (lazy load)
│   ├── GET Single Stage
│   ├── POST Create Stage
│   ├── PATCH Update Stage
│   ├── DELETE Stage
│   └── PUT Reorder Stages
└── 3. Deals/
    ├── POST Create Deal
    ├── GET All Deals (with filters)
    ├── GET Single Deal
    ├── PATCH Update Deal
    ├── PUT Move to Stage
    ├── PUT Update Status
    ├── DELETE Deal
    └── GET Pipeline Value
```

### Environment Variables:
- `baseUrl`: `http://localhost:8080/api`
- `token`: `<JWT dari login response>`

---

## 🔍 Debug Tips:

### 1. Check server logs saat request:
```
🚀 Server starting on port 8080
[GIN] 2026/02/19 - 10:00:00 | 200 | GET /api/pipeline/stages
```

### 2. Verify token di JWT.io:
- Copy token ke https://jwt.io
- Check payload ada: `user_id`, `email`, `tenant_id`, `role`

### 3. Test health check dulu:
```bash
curl http://localhost:8080/health
# Response: {"status":"ok"}
```

---

## 📞 Example: Full Workflow

```bash
# 1. Register (atau login kalau sudah punya akun)
TOKEN=$(curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}' \
  | jq -r '.token')

echo "Token: $TOKEN"

# 2. Get pipeline stages (auto-create 6 defaults)
curl -X GET http://localhost:8080/api/pipeline/stages \
  -H "Authorization: Bearer $TOKEN" | jq

# 3. Create deal
curl -X POST http://localhost:8080/api/deals \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Deal",
    "value": 1000000,
    "contact_id": 1,
    "stage_id": 1
  }' | jq

# 4. Get all deals
curl -X GET http://localhost:8080/api/deals \
  -H "Authorization: Bearer $TOKEN" | jq
```

Selamat testing! 🎉
