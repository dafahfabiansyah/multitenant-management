package repository

import (
	"gin-quickstart/internal/model"

	"gorm.io/gorm"
)

type PipelineStageRepository interface {
	Create(stage *model.PipelineStage) error
	FindByID(tenantID, id uint) (*model.PipelineStage, error)
	FindAll(tenantID uint) ([]model.PipelineStage, error)
	Update(stage *model.PipelineStage) error
	Delete(tenantID, id uint) error
	CountByTenant(tenantID uint) (int64, error)
	Reorder(tenantID uint, stageIDs []uint) error
	CreateDefaultStages(tenantID uint) error
	CountDealsByStage(tenantID, stageID uint) (int64, error)
}

type pipelineStageRepository struct {
	db *gorm.DB
}

func NewPipelineStageRepository(db *gorm.DB) PipelineStageRepository {
	return &pipelineStageRepository{db: db}
}

func (r *pipelineStageRepository) Create(stage *model.PipelineStage) error {
	return r.db.Create(stage).Error
}

func (r *pipelineStageRepository) FindByID(tenantID, id uint) (*model.PipelineStage, error) {
	var stage model.PipelineStage
	err := r.db.Scopes(model.TenantScope(tenantID)).
		First(&stage, id).Error
	if err != nil {
		return nil, err
	}
	return &stage, nil
}

func (r *pipelineStageRepository) FindAll(tenantID uint) ([]model.PipelineStage, error) {
	var stages []model.PipelineStage
	err := r.db.Scopes(model.TenantScope(tenantID)).
		Order("\"order\" ASC").
		Find(&stages).Error
	return stages, err
}

func (r *pipelineStageRepository) Update(stage *model.PipelineStage) error {
	return r.db.Model(&model.PipelineStage{}).
		Where("id = ?", stage.ID).
		Updates(stage).Error
}

func (r *pipelineStageRepository) Delete(tenantID, id uint) error {
	return r.db.Scopes(model.TenantScope(tenantID)).
		Delete(&model.PipelineStage{}, id).Error
}

func (r *pipelineStageRepository) CountByTenant(tenantID uint) (int64, error) {
	var count int64
	err := r.db.Model(&model.PipelineStage{}).
		Scopes(model.TenantScope(tenantID)).
		Count(&count).Error
	return count, err
}

// Reorder updates the order of multiple stages
func (r *pipelineStageRepository) Reorder(tenantID uint, stageIDs []uint) error {
	// Use transaction to ensure atomic update
	return r.db.Transaction(func(tx *gorm.DB) error {
		for i, stageID := range stageIDs {
			if err := tx.Model(&model.PipelineStage{}).
				Where("tenant_id = ? AND id = ?", tenantID, stageID).
				Update("order", i+1).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

// CreateDefaultStages creates 6 default pipeline stages for a tenant
func (r *pipelineStageRepository) CreateDefaultStages(tenantID uint) error {
	defaultStages := []model.PipelineStage{
		{
			TenantID:    tenantID,
			Name:        "Lead",
			Order:       1,
			Probability: 10,
			Color:       "#3B82F6", // Blue
			IsDefault:   true,
		},
		{
			TenantID:    tenantID,
			Name:        "Qualified",
			Order:       2,
			Probability: 25,
			Color:       "#06B6D4", // Cyan
			IsDefault:   true,
		},
		{
			TenantID:    tenantID,
			Name:        "Proposal",
			Order:       3,
			Probability: 50,
			Color:       "#EAB308", // Yellow
			IsDefault:   true,
		},
		{
			TenantID:    tenantID,
			Name:        "Negotiation",
			Order:       4,
			Probability: 75,
			Color:       "#F97316", // Orange
			IsDefault:   true,
		},
		{
			TenantID:    tenantID,
			Name:        "Closed Won",
			Order:       5,
			Probability: 100,
			Color:       "#10B981", // Green
			IsDefault:   true,
			IsClosedWon: true,
		},
		{
			TenantID:     tenantID,
			Name:         "Closed Lost",
			Order:        6,
			Probability:  0,
			Color:        "#EF4444", // Red
			IsDefault:    true,
			IsClosedLost: true,
		},
	}

	return r.db.Create(&defaultStages).Error
}

// CountDealsByStage counts how many deals are in a specific stage
func (r *pipelineStageRepository) CountDealsByStage(tenantID, stageID uint) (int64, error) {
	var count int64
	err := r.db.Model(&model.Deal{}).
		Where("tenant_id = ? AND stage_id = ?", tenantID, stageID).
		Count(&count).Error
	return count, err
}
