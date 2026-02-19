package repository

import (
	"gin-quickstart/internal/model"

	"gorm.io/gorm"
)

type DealRepository interface {
	FindAll(tenantID uint, filter DealFilter) ([]model.Deal, error)
	FindByID(tenantID uint, id uint) (*model.Deal, error)
	Create(deal *model.Deal) error
	Update(deal *model.Deal) error
	UpdateFields(tenantID uint, dealID uint, updates map[string]interface{}) error
	Delete(deal *model.Deal) error
	MoveToStage(tenantID uint, dealID uint, newStageID uint) error
	UpdateStatus(tenantID uint, dealID uint, status string) error
	Count(tenantID uint, filter DealFilter) (int64, error)
	GetTotalValueByStage(tenantID uint) (map[uint]float64, error)
}

type dealRepository struct {
	db *gorm.DB
}

func NewDealRepository(db *gorm.DB) DealRepository {
	return &dealRepository{db: db}
}

// FindAll returns all deals for a tenant with filters
func (r *dealRepository) FindAll(tenantID uint, filter DealFilter) ([]model.Deal, error) {
	var deals []model.Deal
	query := r.db.Scopes(model.TenantScope(tenantID)).
		Preload("Stage").
		Preload("Contact")

	// Filter by stage
	if filter.StageID != nil {
		query = query.Where("stage_id = ?", *filter.StageID)
	}

	// Filter by status
	if filter.Status != "" {
		query = query.Where("status = ?", filter.Status)
	}

	// Filter by contact
	if filter.ContactID != nil {
		query = query.Where("contact_id = ?", *filter.ContactID)
	}

	// Filter by value range
	if filter.MinValue != nil {
		query = query.Where("value >= ?", *filter.MinValue)
	}
	if filter.MaxValue != nil {
		query = query.Where("value <= ?", *filter.MaxValue)
	}

	// Filter by expected close date range
	if filter.ExpectedCloseStart != nil {
		query = query.Where("expected_close_date >= ?", *filter.ExpectedCloseStart)
	}
	if filter.ExpectedCloseEnd != nil {
		query = query.Where("expected_close_date <= ?", *filter.ExpectedCloseEnd)
	}

	// Search by title or description
	if filter.Search != "" {
		searchPattern := "%" + filter.Search + "%"
		query = query.Where("title ILIKE ? OR description ILIKE ?", searchPattern, searchPattern)
	}

	// Sort
	if filter.SortBy != "" {
		order := filter.SortBy
		if filter.SortOrder == "desc" {
			order += " DESC"
		} else {
			order += " ASC"
		}
		query = query.Order(order)
	} else {
		query = query.Order("created_at DESC")
	}

	// Pagination
	if filter.Limit > 0 {
		query = query.Limit(filter.Limit)
	}
	if filter.Offset > 0 {
		query = query.Offset(filter.Offset)
	}

	err := query.Find(&deals).Error
	return deals, err
}

// FindByID returns a single deal by ID
func (r *dealRepository) FindByID(tenantID uint, id uint) (*model.Deal, error) {
	var deal model.Deal
	err := r.db.Scopes(model.TenantScope(tenantID)).
		Preload("Stage").
		Preload("Contact").
		First(&deal, id).Error
	if err != nil {
		return nil, err
	}
	return &deal, nil
}

// Create creates a new deal
func (r *dealRepository) Create(deal *model.Deal) error {
	return r.db.Create(deal).Error
}

// Update updates a deal
func (r *dealRepository) Update(deal *model.Deal) error {
	// Preserve immutable fields
	deal.TenantID = 0
	deal.CreatedBy = 0
	return r.db.Model(deal).Updates(deal).Error
}

// UpdateFields updates specific fields of a deal
func (r *dealRepository) UpdateFields(tenantID uint, dealID uint, updates map[string]interface{}) error {
	return r.db.Model(&model.Deal{}).
		Scopes(model.TenantScope(tenantID)).
		Where("id = ?", dealID).
		Updates(updates).Error
}

// Delete deletes a deal (soft delete)
func (r *dealRepository) Delete(deal *model.Deal) error {
	return r.db.Delete(deal).Error
}

// MoveToStage moves a deal to a different stage
func (r *dealRepository) MoveToStage(tenantID uint, dealID uint, newStageID uint) error {
	return r.db.Model(&model.Deal{}).
		Scopes(model.TenantScope(tenantID)).
		Where("id = ?", dealID).
		Update("stage_id", newStageID).Error
}

// UpdateStatus updates deal status
func (r *dealRepository) UpdateStatus(tenantID uint, dealID uint, status string) error {
	return r.db.Model(&model.Deal{}).
		Scopes(model.TenantScope(tenantID)).
		Where("id = ?", dealID).
		Update("status", status).Error
}

// Count returns total number of deals for a tenant with filters
func (r *dealRepository) Count(tenantID uint, filter DealFilter) (int64, error) {
	var count int64
	query := r.db.Model(&model.Deal{}).Scopes(model.TenantScope(tenantID))

	// Apply same filters as FindAll
	if filter.StageID != nil {
		query = query.Where("stage_id = ?", *filter.StageID)
	}
	if filter.Status != "" {
		query = query.Where("status = ?", filter.Status)
	}
	if filter.ContactID != nil {
		query = query.Where("contact_id = ?", *filter.ContactID)
	}
	if filter.MinValue != nil {
		query = query.Where("value >= ?", *filter.MinValue)
	}
	if filter.MaxValue != nil {
		query = query.Where("value <= ?", *filter.MaxValue)
	}
	if filter.ExpectedCloseStart != nil {
		query = query.Where("expected_close_date >= ?", *filter.ExpectedCloseStart)
	}
	if filter.ExpectedCloseEnd != nil {
		query = query.Where("expected_close_date <= ?", *filter.ExpectedCloseEnd)
	}
	if filter.Search != "" {
		searchPattern := "%" + filter.Search + "%"
		query = query.Where("title ILIKE ? OR description ILIKE ?", searchPattern, searchPattern)
	}

	err := query.Count(&count).Error
	return count, err
}

// GetTotalValueByStage returns sum of deal values grouped by stage
func (r *dealRepository) GetTotalValueByStage(tenantID uint) (map[uint]float64, error) {
	type StageValue struct {
		StageID    uint
		TotalValue float64
	}

	var results []StageValue
	err := r.db.Model(&model.Deal{}).
		Select("stage_id, SUM(value) as total_value").
		Scopes(model.TenantScope(tenantID)).
		Where("status = ?", "active").
		Group("stage_id").
		Scan(&results).Error

	if err != nil {
		return nil, err
	}

	valueMap := make(map[uint]float64)
	for _, result := range results {
		valueMap[result.StageID] = result.TotalValue
	}

	return valueMap, nil
}

// DealFilter contains filters for deal queries
type DealFilter struct {
	StageID            *uint
	Status             string
	ContactID          *uint
	MinValue           *float64
	MaxValue           *float64
	ExpectedCloseStart *string
	ExpectedCloseEnd   *string
	Search             string
	SortBy             string
	SortOrder          string
	Limit              int
	Offset             int
}
