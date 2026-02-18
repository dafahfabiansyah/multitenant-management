package model

import (
	"gorm.io/gorm"
)

// TenantScoped is an interface for models that belong to a tenant
type TenantScoped interface {
	GetTenantID() uint
}

// Implementing GetTenantID for tenant-scoped models
func (ts *TenantSetting) GetTenantID() uint {
	return ts.TenantID
}

func (al *AuditLog) GetTenantID() uint {
	return al.TenantID
}

func (tu *TenantUser) GetTenantID() uint {
	return tu.TenantID
}

// TenantScope is a GORM scope that automatically filters by tenant_id
// This ensures data isolation between tenants at the query level
func TenantScope(tenantID uint) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("tenant_id = ?", tenantID)
	}
}

// ActiveTenantScope filters only active tenants
func ActiveTenantScope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("status = ?", "active")
	}
}

// ActiveUserScope filters only active users
func ActiveUserScope() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("is_active = ?", true)
	}
}

// PreloadTenant efficiently preloads tenant data
func PreloadTenant() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Preload("Tenant")
	}
}

// PreloadUser efficiently preloads user data
func PreloadUser() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Preload("User")
	}
}

// Pagination scope for efficient large dataset queries
func Paginate(page, pageSize int) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		if page <= 0 {
			page = 1
		}
		if pageSize <= 0 {
			pageSize = 10
		}
		if pageSize > 100 {
			pageSize = 100 // Max limit to prevent abuse
		}

		offset := (page - 1) * pageSize
		return db.Offset(offset).Limit(pageSize)
	}
}

// OrderByCreatedAt orders records by created_at descending
func OrderByCreatedAt() func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Order("created_at DESC")
	}
}
