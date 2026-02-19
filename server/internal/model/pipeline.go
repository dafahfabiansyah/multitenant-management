package model

import (
	"time"

	"gorm.io/gorm"
)

// PipelineStage represents a stage in the sales pipeline
type PipelineStage struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	TenantID uint `gorm:"not null;index:idx_tenant_stage" json:"tenant_id"`

	Name        string `gorm:"type:varchar(100);not null" json:"name"`
	Order       int    `gorm:"not null" json:"order"`                           // Display order (1, 2, 3...)
	Probability int    `gorm:"default:0" json:"probability"`                    // 0-100 (win probability)
	Color       string `gorm:"type:varchar(20);default:'#3B82F6'" json:"color"` // Hex color for UI

	// Type flags
	IsDefault    bool `gorm:"default:false" json:"is_default"`     // Was this auto-created?
	IsClosedWon  bool `gorm:"default:false" json:"is_closed_won"`  // Terminal stage: Won
	IsClosedLost bool `gorm:"default:false" json:"is_closed_lost"` // Terminal stage: Lost

	// Relationships
	Tenant Tenant `gorm:"foreignKey:TenantID;constraint:OnDelete:CASCADE" json:"-"`
}

// TableName overrides the table name
func (PipelineStage) TableName() string {
	return "pipeline_stages"
}

// GetTenantID implements TenantScoped interface
func (p *PipelineStage) GetTenantID() uint {
	return p.TenantID
}

// Deal represents a sales opportunity in the pipeline
type Deal struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	TenantID  uint `gorm:"not null;index:idx_tenant_deal" json:"tenant_id"`
	CreatedBy uint `gorm:"not null;index" json:"created_by"` // User who created this deal
	ContactID uint `gorm:"not null;index" json:"contact_id"` // Link to contact

	// Basic Information
	Title       string  `gorm:"type:varchar(255);not null" json:"title"`
	Description string  `gorm:"type:text" json:"description"`
	Value       float64 `gorm:"type:decimal(15,2);default:0" json:"value"` // Deal value
	Currency    string  `gorm:"type:varchar(10);default:'IDR'" json:"currency"`

	// Pipeline Stage
	StageID     uint `gorm:"not null;index" json:"stage_id"` // Current pipeline stage
	StageOrder  int  `gorm:"default:0" json:"stage_order"`   // Order within stage (for sorting)
	Probability int  `gorm:"default:0" json:"probability"`   // Win probability (0-100)

	// Timeline
	ExpectedCloseDate *time.Time `json:"expected_close_date,omitempty"`
	ActualCloseDate   *time.Time `json:"actual_close_date,omitempty"`

	// Outcome
	Status     string `gorm:"type:varchar(20);default:'open';index" json:"status"` // open, won, lost
	LossReason string `gorm:"type:varchar(255)" json:"loss_reason,omitempty"`      // If lost: reason

	// Tracking
	Source string      `gorm:"type:varchar(50);index" json:"source"` // inbound, outbound, referral
	Tags   StringArray `gorm:"type:text;serializer:json" json:"tags"`
	Notes  string      `gorm:"type:text" json:"notes"`

	// Relationships
	Tenant  Tenant        `gorm:"foreignKey:TenantID;constraint:OnDelete:CASCADE" json:"-"`
	Contact Contact       `gorm:"foreignKey:ContactID;constraint:OnDelete:CASCADE" json:"contact,omitempty"`
	Stage   PipelineStage `gorm:"foreignKey:StageID;constraint:OnDelete:RESTRICT" json:"stage,omitempty"`
	User    User          `gorm:"foreignKey:CreatedBy;constraint:OnDelete:SET NULL" json:"-"`
}

// TableName overrides the table name
func (Deal) TableName() string {
	return "deals"
}

// GetTenantID implements TenantScoped interface
func (d *Deal) GetTenantID() uint {
	return d.TenantID
}

// DealFilter represents filter parameters for deal queries
type DealFilter struct {
	Search              string     // Search in title, description
	StageID             uint       // Filter by stage
	Status              string     // Filter by status (open, won, lost)
	ContactID           uint       // Filter by contact
	CreatedBy           uint       // Filter by creator
	Source              string     // Filter by source
	Tags                []string   // Filter by tags
	MinValue            float64    // Minimum deal value
	MaxValue            float64    // Maximum deal value
	ExpectedCloseBefore *time.Time // Expected close before date
	ExpectedCloseAfter  *time.Time // Expected close after date
}
