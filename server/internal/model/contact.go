package model

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"

	"gorm.io/gorm"
)

// StringArray is a custom type for handling JSON string arrays
type StringArray []string

// Scan implements the sql.Scanner interface for reading from database
func (s *StringArray) Scan(value interface{}) error {
	if value == nil {
		*s = []string{}
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("failed to scan StringArray")
	}

	if len(bytes) == 0 {
		*s = []string{}
		return nil
	}

	return json.Unmarshal(bytes, s)
}

// Value implements the driver.Valuer interface for writing to database
func (s StringArray) Value() (driver.Value, error) {
	if len(s) == 0 {
		return "[]", nil
	}
	return json.Marshal(s)
}

// Contact represents a customer/contact in the CRM system
type Contact struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	TenantID  uint `gorm:"not null;index:idx_tenant_contact" json:"tenant_id"`
	CreatedBy uint `gorm:"not null;index" json:"created_by"` // User who created this contact

	// Personal Information
	FirstName string `gorm:"type:varchar(100);not null;index" json:"first_name"`
	LastName  string `gorm:"type:varchar(100);index" json:"last_name"`
	Email     string `gorm:"type:varchar(255);index:idx_tenant_email" json:"email"`
	Phone     string `gorm:"type:varchar(50);index" json:"phone"`
	Mobile    string `gorm:"type:varchar(50)" json:"mobile"`

	// Company Information
	CompanyName string `gorm:"type:varchar(255);index" json:"company_name"`
	Position    string `gorm:"type:varchar(100)" json:"position"`
	Department  string `gorm:"type:varchar(100)" json:"department"`

	// Address Information
	Address    string `gorm:"type:text" json:"address"`
	City       string `gorm:"type:varchar(100)" json:"city"`
	Province   string `gorm:"type:varchar(100)" json:"province"`
	PostalCode string `gorm:"type:varchar(20)" json:"postal_code"`
	Country    string `gorm:"type:varchar(100);default:'Indonesia'" json:"country"`

	// Additional Information
	Status string      `gorm:"type:varchar(20);default:'active';index" json:"status"` // active, inactive, blocked
	Source string      `gorm:"type:varchar(50);index" json:"source"`                  // website, referral, ads, cold_call, event
	Tags   StringArray `gorm:"type:text;serializer:json" json:"tags"`                 // JSON array: ["VIP", "potential"]
	Notes  string      `gorm:"type:text" json:"notes"`

	// Relationships
	Tenant Tenant `gorm:"foreignKey:TenantID;constraint:OnDelete:CASCADE" json:"-"`
	User   User   `gorm:"foreignKey:CreatedBy;constraint:OnDelete:SET NULL" json:"-"`
}

// TableName overrides the table name
func (Contact) TableName() string {
	return "contacts"
}

// GetTenantID implements TenantScoped interface
func (c *Contact) GetTenantID() uint {
	return c.TenantID
}

// ContactFilter represents filter parameters for contact queries
type ContactFilter struct {
	Search   string   // Search in name, email, phone, company
	Status   string   // Filter by status
	Source   string   // Filter by source
	Tags     []string // Filter by tags
	City     string   // Filter by city
	Province string   // Filter by province
}
