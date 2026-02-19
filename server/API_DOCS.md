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

## 📊 Dashboard Endpoints

### 5. Get Dashboard Statistics
Returns dashboard statistics with configurable time period.

**Endpoint:** `GET /dashboard/stats`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `period` (optional, default: "month") - Time period for statistics
  - `week` - Last 7 days vs previous 7 days
  - `month` - Last 30 days vs previous 30 days
  - `quarter` - Last 90 days vs previous 90 days

**Example Request:**
```
GET /dashboard/stats?period=month
```

**Response (200 OK):**
```json
{
  "stats": {
    "total_contacts": {
      "current": 156,
      "previous": 120,
      "growth_percentage": 30.0
    },
    "recent_activities": {
      "current": 89,
      "previous": 75,
      "growth_percentage": 18.67
    },
    "growth_rate": 30.0
  },
  "period": "month"
}
```

**Field Descriptions:**
- `total_contacts.current` - Number of contacts created in current period
- `total_contacts.previous` - Number of contacts created in previous period
- `total_contacts.growth_percentage` - Percentage growth (positive = growth, negative = decline)
- `recent_activities.current` - Number of activities (audit logs) in current period
- `recent_activities.previous` - Number of activities in previous period
- `recent_activities.growth_percentage` - Activity growth percentage
- `growth_rate` - Overall growth rate (same as contacts growth)

**Notes:**
- All statistics are automatically filtered by tenant (multi-tenant isolation)
- Accessible by all authenticated users (admin, manager, member)
- Timezone is server timezone

---

## 🏢 Tenant Management Endpoints

### 6. Get Current Tenant Info
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

### 7. Update Tenant
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

### 8. Get Tenant Users
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

### 9. Add User to Tenant
Creates a new user or adds an existing user to the tenant (Admin only).

**Endpoint:** `POST /tenant/users`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123",
  "full_name": "New User",
  "role": "member"
}
```

**Field Details:**
- `email` (required): User's email address
- `password` (optional): Required if user doesn't exist, ignored if user already exists
- `full_name` (optional): Full name for new users
- `role` (required): User role in tenant: `admin`, `manager`, or `member`

**Behavior:**
- If email exists: Adds existing user to tenant with specified role
- If email doesn't exist: Creates new user with password and adds to tenant
- Returns error if user already in tenant

**Response (201 Created) - New User:**
```json
{
  "message": "User created and added to tenant successfully",
  "user": {
    "id": 3,
    "email": "newuser@example.com",
    "full_name": "New User",
    "is_active": true,
    "created_at": "2026-02-19T10:00:00Z"
  },
  "is_new_user": true
}
```

**Response (201 Created) - Existing User:**
```json
{
  "message": "User added to tenant successfully",
  "user": {
    "id": 2,
    "email": "existing@example.com",
    "full_name": "Existing User",
    "is_active": true
  },
  "is_new_user": false
}
```

**Error Responses:**
```json
{
  "error": "password is required for new user"
}
```
```json
{
  "error": "user already exists in this tenant"
}
```
```json
{
  "error": "invalid role. must be: admin, manager, or member"
}
```

---

### 10. Update User Role
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

### 11. Remove User from Tenant
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

### 12. Get Audit Logs
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

## � CRM - Contact Management Endpoints

### 13. Create Contact
Creates a new contact in the CRM system.

**Endpoint:** `POST /contacts`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@example.com",
  "phone": "+1-555-0123",
  "mobile": "+1-555-0124",
  "company_name": "ABC Corporation",
  "position": "Marketing Manager",
  "department": "Marketing",
  "address": "123 Main Street",
  "city": "New York",
  "province": "NY",
  "postal_code": "10001",
  "country": "USA",
  "status": "active",
  "source": "referral",
  "tags": ["vip", "enterprise"],
  "notes": "Referred by John Doe"
}
```

**Response (201 Created):**
```json
{
  "message": "Contact created successfully",
  "contact": {
    "id": 1,
    "tenant_id": 1,
    "created_by": 1,
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane.smith@example.com",
    "phone": "+1-555-0123",
    "mobile": "+1-555-0124",
    "company_name": "ABC Corporation",
    "position": "Marketing Manager",
    "department": "Marketing",
    "address": "123 Main Street",
    "city": "New York",
    "province": "NY",
    "postal_code": "10001",
    "country": "USA",
    "status": "active",
    "source": "referral",
    "tags": ["vip", "enterprise"],
    "notes": "Referred by John Doe",
    "created_at": "2026-02-18T10:00:00Z",
    "updated_at": "2026-02-18T10:00:00Z"
  }
}
```

---

### 14. Get Contact by ID
Retrieves a single contact by ID.

**Endpoint:** `GET /contacts/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "contact": {
    "id": 1,
    "tenant_id": 1,
    "created_by": 1,
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane.smith@example.com",
    "phone": "+1-555-0123",
    "company_name": "ABC Corporation",
    "status": "active",
    "source": "referral",
    "tags": ["vip", "enterprise"],
    "created_at": "2026-02-18T10:00:00Z",
    "updated_at": "2026-02-18T10:00:00Z"
  }
}
```

---

### 15. Get All Contacts (with Filtering)
Retrieves a paginated list of contacts with advanced filtering.

**Endpoint:** `GET /contacts`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (int, default: 1) - Page number
- `page_size` (int, default: 20) - Items per page
- `search` (string) - Search across first_name, last_name, email, phone, company_name
- `status` (string) - Filter by status: active, inactive, blocked
- `source` (string) - Filter by source: website, referral, ads, cold_call, event
- `city` (string) - Filter by city
- `province` (string) - Filter by province/state
- `tags` (string) - Comma-separated tags to filter (e.g., "vip,enterprise")

**Example Request:**
```
GET /contacts?page=1&page_size=20&status=active&source=referral&search=Smith
```

**Response (200 OK):**
```json
{
  "contacts": [
    {
      "id": 1,
      "tenant_id": 1,
      "created_by": 1,
      "first_name": "Jane",
      "last_name": "Smith",
      "email": "jane.smith@example.com",
      "phone": "+1-555-0123",
      "company_name": "ABC Corporation",
      "status": "active",
      "source": "referral",
      "tags": ["vip", "enterprise"],
      "created_at": "2026-02-18T10:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 20,
  "total_pages": 1
}
```

---

### 16. Search Contacts
Quick search endpoint for contacts.

**Endpoint:** `GET /contacts/search`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `q` (string, required) - Search query
- `page` (int, default: 1)
- `page_size` (int, default: 20)

**Example Request:**
```
GET /contacts/search?q=Jane&page=1&page_size=20
```

**Response (200 OK):**
```json
{
  "contacts": [
    {
      "id": 1,
      "first_name": "Jane",
      "last_name": "Smith",
      "email": "jane.smith@example.com",
      "company_name": "ABC Corporation"
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 20,
  "query": "Jane"
}
```

---

### 17. Update Contact
Updates an existing contact (partial update supported).

**Endpoint:** `PATCH /contacts/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:** (all fields optional, only send fields you want to update)
```json
{
  "first_name": "Jane",
  "last_name": "Smith-Johnson",
  "email": "jane.johnson@example.com",
  "phone": "+1-555-0125",
  "status": "active",
  "notes": "Updated contact information"
}
```

**Note:** This is a PATCH endpoint, so you can send only the fields you want to update. Fields not included in the request will remain unchanged. `tenant_id` and `created_by` are immutable and cannot be changed.

**Response (200 OK):**
```json
{
  "message": "Contact updated successfully",
  "contact": {
    "id": 1,
    "first_name": "Jane",
    "last_name": "Smith-Johnson",
    "email": "jane.johnson@example.com",
    "updated_at": "2026-02-18T11:00:00Z"
  }
}
```

---

### 18. Delete Contact
Soft deletes a contact (can be restored from database).

**Endpoint:** `DELETE /contacts/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Contact deleted successfully"
}
```

---

### 📋 Contact Status & Source Values

**Valid Status Values:**
- `active` - Active contact (default)
- `inactive` - Inactive contact  
- `blocked` - Blocked contact

**Valid Source Values:**
- `website` - From website form
- `referral` - Referred by existing customer
- `ads` - From advertising campaign
- `cold_call` - From cold calling
- `event` - From event/conference

---
## 📊 Sales Pipeline Endpoints

### 19. Get Pipeline Stages
Retrieves all pipeline stages for the tenant. **Automatically creates 6 default stages on first access** (lazy loading).

**Endpoint:** `GET /pipeline/stages`

**Headers:**
```
Authorization: Bearer <token>
```

**Default Stages (auto-created on first call):**
1. **Lead** (10% probability, Blue)
2. **Qualified** (25% probability, Cyan)
3. **Proposal** (50% probability, Yellow)
4. **Negotiation** (75% probability, Orange)
5. **Closed Won** (100% probability, Green)
6. **Closed Lost** (0% probability, Red)

**Response (200 OK):**
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
      "is_closed_lost": false,
      "created_at": "2026-02-18T10:00:00Z"
    },
    {
      "id": 2,
      "name": "Qualified",
      "order": 2,
      "probability": 25,
      "color": "#06B6D4",
      "is_default": true,
      "is_closed_won": false,
      "is_closed_lost": false
    }
  ],
  "total": 6
}
```

---

### 20. Get Single Stage
Retrieves a specific pipeline stage by ID.

**Endpoint:** `GET /pipeline/stages/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "stage": {
    "id": 1,
    "name": "Lead",
    "order": 1,
    "probability": 10,
    "color": "#3B82F6",
    "is_default": true
  }
}
```

---

### 21. Create Custom Stage
Creates a new custom pipeline stage.

**Endpoint:** `POST /pipeline/stages`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Demo Scheduled",
  "order": 3,
  "probability": 35,
  "color": "#8B5CF6",
  "is_closed_won": false,
  "is_closed_lost": false
}
```

**Response (201 Created):**
```json
{
  "message": "Stage created successfully",
  "stage": {
    "id": 7,
    "name": "Demo Scheduled",
    "order": 3,
    "probability": 35,
    "color": "#8B5CF6",
    "is_default": false,
    "is_closed_won": false,
    "is_closed_lost": false,
    "created_at": "2026-02-18T11:00:00Z"
  }
}
```

---

### 22. Update Stage
Updates an existing pipeline stage.

**Endpoint:** `PATCH /pipeline/stages/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:** (all fields optional)
```json
{
  "name": "Demo Completed",
  "probability": 40,
  "color": "#7C3AED"
}
```

**Response (200 OK):**
```json
{
  "message": "Stage updated successfully",
  "stage": {
    "id": 7,
    "name": "Demo Completed",
    "probability": 40,
    "color": "#7C3AED"
  }
}
```

---

### 23. Delete Stage
Deletes a pipeline stage. **Cannot delete if deals exist in this stage.**

**Endpoint:** `DELETE /pipeline/stages/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Stage deleted successfully"
}
```

**Error (400 Bad Request) - If deals exist:**
```json
{
  "error": "cannot delete stage with existing deals"
}
```

---

### 24. Reorder Stages
Updates the display order of pipeline stages (for drag-and-drop UI).

**Endpoint:** `PUT /pipeline/stages/reorder`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "stage_ids": [1, 2, 7, 3, 4, 5, 6]
}
```

**Note:** Provide ALL stage IDs in desired order. Transaction-based for atomicity.

**Response (200 OK):**
```json
{
  "message": "Stages reordered successfully"
}
```

---

## 💼 Deal Management Endpoints

### 25. Create Deal
Creates a new sales deal/opportunity.

**Endpoint:** `POST /deals`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Enterprise Software License",
  "description": "Annual subscription for 100 users",
  "value": 50000.00,
  "currency": "IDR",
  "contact_id": 1,
  "stage_id": 1,
  "expected_close_date": "2026-03-31T00:00:00Z",
  "source": "referral",
  "tags": ["enterprise", "software"],
  "notes": "High priority deal"
}
```

**Response (201 Created):**
```json
{
  "message": "Deal created successfully",
  "deal": {
    "id": 1,
    "title": "Enterprise Software License",
    "description": "Annual subscription for 100 users",
    "value": 50000.00,
    "currency": "IDR",
    "contact_id": 1,
    "stage_id": 1,
    "probability": 10,
    "status": "active",
    "expected_close_date": "2026-03-31T00:00:00Z",
    "source": "referral",
    "tags": ["enterprise", "software"],
    "created_at": "2026-02-18T10:00:00Z"
  }
}
```

---

### 26. Get All Deals (with Filters)
Retrieves deals with comprehensive filtering options.

**Endpoint:** `GET /deals`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `stage_id` - Filter by pipeline stage
- `status` - Filter by status (`active`, `won`, `lost`, `cancelled`)
- `contact_id` - Filter by contact
- `min_value` - Minimum deal value
- `max_value` - Maximum deal value
- `expected_close_start` - Expected close date range start (ISO 8601)
- `expected_close_end` - Expected close date range end (ISO 8601)
- `search` - Search in title or description
- `sort_by` - Sort field (default: `created_at`)
- `sort_order` - Sort direction (`asc` or `desc`, default: `desc`)
- `limit` - Results per page (default: 20)
- `offset` - Pagination offset

**Example:**
```
GET /deals?stage_id=2&status=active&min_value=10000&search=software&limit=10
```

**Response (200 OK):**
```json
{
  "deals": [
    {
      "id": 1,
      "title": "Enterprise Software License",
      "value": 50000.00,
      "stage": {
        "id": 2,
        "name": "Qualified",
        "probability": 25
      },
      "contact": {
        "id": 1,
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com"
      },
      "status": "active",
      "probability": 25,
      "created_at": "2026-02-18T10:00:00Z"
    }
  ],
  "total": 1,
  "limit": 10,
  "offset": 0
}
```

---

### 27. Get Deal by ID
Retrieves a single deal with preloaded relationships.

**Endpoint:** `GET /deals/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "deal": {
    "id": 1,
    "title": "Enterprise Software License",
    "description": "Annual subscription for 100 users",
    "value": 50000.00,
    "currency": "IDR",
    "stage": {
      "id": 2,
      "name": "Qualified",
      "color": "#06B6D4"
    },
    "contact": {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "company": "Acme Corp"
    },
    "probability": 25,
    "status": "active",
    "expected_close_date": "2026-03-31T00:00:00Z",
    "tags": ["enterprise", "software"],
    "notes": "High priority deal",
    "created_at": "2026-02-18T10:00:00Z",
    "updated_at": "2026-02-18T10:30:00Z"
  }
}
```

---

### 28. Update Deal
Updates an existing deal (partial update).

**Endpoint:** `PATCH /deals/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:** (all fields optional)
```json
{
  "title": "Enterprise Software License - Extended",
  "value": 75000.00,
  "stage_id": 3,
  "notes": "Deal expanded to include training"
}
```

**Note:** When `stage_id` is updated, `probability` automatically syncs with new stage's probability.

**Response (200 OK):**
```json
{
  "message": "Deal updated successfully",
  "deal": {
    "id": 1,
    "title": "Enterprise Software License - Extended",
    "value": 75000.00,
    "stage_id": 3,
    "probability": 50,
    "updated_at": "2026-02-18T11:00:00Z"
  }
}
```

---

### 29. Move Deal to Stage
Moves a deal to a different pipeline stage with automatic probability update.

**Endpoint:** `PUT /deals/:id/move`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "stage_id": 4
}
```

**Auto-behaviors:**
- Updates `probability` to match new stage
- If moved to "Closed Won" stage → sets `status` to `won`
- If moved to "Closed Lost" stage → sets `status` to `lost`

**Response (200 OK):**
```json
{
  "message": "Deal moved successfully",
  "deal": {
    "id": 1,
    "title": "Enterprise Software License",
    "stage_id": 4,
    "stage": {
      "id": 4,
      "name": "Negotiation",
      "probability": 75
    },
    "probability": 75,
    "status": "active",
    "updated_at": "2026-02-18T12:00:00Z"
  }
}
```

---

### 30. Update Deal Status
Updates deal status independently of stage.

**Endpoint:** `PUT /deals/:id/status`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "won"
}
```

**Valid Status Values:**
- `active` - Deal in progress
- `won` - Deal won
- `lost` - Deal lost
- `cancelled` - Deal cancelled

**Response (200 OK):**
```json
{
  "message": "Deal status updated successfully"
}
```

---

### 31. Delete Deal
Soft deletes a deal.

**Endpoint:** `DELETE /deals/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Deal deleted successfully"
}
```

---

### 32. Get Pipeline Value
Returns total deal value grouped by pipeline stage (for pipeline analytics).

**Endpoint:** `GET /deals/pipeline-value`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "pipeline_values": {
    "1": 125000.50,
    "2": 340000.00,
    "3": 275000.75,
    "4": 180000.00,
    "5": 500000.00,
    "6": 0
  }
}
```

**Note:** Keys are stage IDs, values are total deal amounts in that stage (only counts `active` deals).

---

### 📋 Deal Field Validations

**Required Fields:**
- `title` - Deal title (max 255 chars)
- `stage_id` - Must exist in tenant's pipeline stages
- `contact_id` - Must be valid contact ID (> 0)

**Optional Fields:**
- `description` - Long text
- `value` - Decimal (15,2) default: 0
- `currency` - String (max 10 chars) default: "IDR"
- `probability` - Auto-synced from stage if not provided
- `status` - Auto-set to "active" on creation
- `expected_close_date` - ISO 8601 datetime
- `source` - String (max 50 chars)
- `tags` - JSON array of strings
- `notes` - Long text

**Auto-managed Fields:**
- `tenant_id` - From JWT token
- `created_by` - From JWT token (immutable)
- `probability` - Synced from stage on create/move
- `status` - Auto-set based on stage terminal flags

---
## �🔑 Role Hierarchy

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
