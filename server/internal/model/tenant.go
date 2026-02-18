package model

import (
	"time"

	"gorm.io/gorm"
)

// Tenant represents a tenant/organization in the multi-tenant system
type Tenant struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	Name   string `gorm:"type:varchar(255);not null;index" json:"name"`
	Status string `gorm:"type:varchar(20);default:'active';index" json:"status"` // active, suspended, inactive

	// Relationships
	Users []TenantUser `gorm:"foreignKey:TenantID" json:"-"`
}

// User represents a user that can belong to multiple tenants
type User struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	Email        string `gorm:"type:varchar(255);uniqueIndex;not null" json:"email"` // Indexed for fast login
	PasswordHash string `gorm:"type:varchar(255);not null" json:"-"`
	FullName     string `gorm:"type:varchar(255)" json:"full_name"`
	IsActive     bool   `gorm:"default:true;index" json:"is_active"` // Indexed for filtering

	// Relationships
	TenantUsers []TenantUser `gorm:"foreignKey:UserID" json:"-"`
}

// TenantUser represents the many-to-many relationship between users and tenants with roles
type TenantUser struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	TenantID uint   `gorm:"not null;index:idx_tenant_user,priority:1" json:"tenant_id"` // Composite index for fast lookup
	UserID   uint   `gorm:"not null;index:idx_tenant_user,priority:2" json:"user_id"`   // Composite index for fast lookup
	Role     string `gorm:"type:varchar(50);not null;default:'member'" json:"role"`     // admin, manager, member

	// Relationships
	Tenant Tenant `gorm:"foreignKey:TenantID;constraint:OnDelete:CASCADE" json:"tenant,omitempty"`
	User   User   `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"user,omitempty"`
}

// TenantSetting stores key-value settings per tenant
type TenantSetting struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	TenantID uint   `gorm:"not null;index:idx_tenant_setting,priority:1" json:"tenant_id"` // Composite index
	Key      string `gorm:"type:varchar(100);not null;index:idx_tenant_setting,priority:2" json:"key"`
	Value    string `gorm:"type:text" json:"value"`

	// Relationships
	Tenant Tenant `gorm:"foreignKey:TenantID;constraint:OnDelete:CASCADE" json:"-"`
}

// AuditLog tracks all important actions per tenant for security
type AuditLog struct {
	ID        uint      `gorm:"primarykey" json:"id"`
	CreatedAt time.Time `gorm:"index" json:"created_at"` // Indexed for time-based queries

	TenantID   uint   `gorm:"not null;index:idx_tenant_audit" json:"tenant_id"` // Indexed for tenant filtering
	UserID     uint   `gorm:"index" json:"user_id"`                             // Indexed for user activity tracking
	Action     string `gorm:"type:varchar(100);index" json:"action"`            // Indexed for action filtering
	Resource   string `gorm:"type:varchar(100)" json:"resource"`
	ResourceID uint   `json:"resource_id,omitempty"`
	IPAddress  string `gorm:"type:varchar(45)" json:"ip_address"`
	UserAgent  string `gorm:"type:text" json:"user_agent,omitempty"`

	// Relationships
	Tenant Tenant `gorm:"foreignKey:TenantID;constraint:OnDelete:CASCADE" json:"-"`
	User   User   `gorm:"foreignKey:UserID;constraint:OnDelete:SET NULL" json:"-"`
}

// TableName overrides (optional, if you want custom table names)
func (Tenant) TableName() string {
	return "tenants"
}

func (User) TableName() string {
	return "users"
}

func (TenantUser) TableName() string {
	return "tenant_users"
}

func (TenantSetting) TableName() string {
	return "tenant_settings"
}

func (AuditLog) TableName() string {
	return "audit_logs"
}
