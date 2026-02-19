package service

import (
	"errors"
	"gin-quickstart/internal/model"
	"gin-quickstart/internal/repository"

	"gorm.io/gorm"
)

type PipelineStageService interface {
	GetStages(tenantID uint) ([]model.PipelineStage, error)
	GetStageByID(tenantID, id uint) (*model.PipelineStage, error)
	CreateStage(stage *model.PipelineStage) error
	UpdateStage(tenantID uint, stage *model.PipelineStage) error
	DeleteStage(tenantID, id uint) error
	ReorderStages(tenantID uint, stageIDs []uint) error
}

type pipelineStageService struct {
	stageRepo repository.PipelineStageRepository
}

func NewPipelineStageService(stageRepo repository.PipelineStageRepository) PipelineStageService {
	return &pipelineStageService{
		stageRepo: stageRepo,
	}
}

// GetStages returns all stages for tenant, creates defaults if none exist (lazy loading)
func (s *pipelineStageService) GetStages(tenantID uint) ([]model.PipelineStage, error) {
	// Check if stages exist
	count, err := s.stageRepo.CountByTenant(tenantID)
	if err != nil {
		return nil, err
	}

	// If no stages exist, create defaults (lazy initialization)
	if count == 0 {
		if err := s.stageRepo.CreateDefaultStages(tenantID); err != nil {
			return nil, err
		}
	}

	// Return all stages
	return s.stageRepo.FindAll(tenantID)
}

func (s *pipelineStageService) GetStageByID(tenantID, id uint) (*model.PipelineStage, error) {
	stage, err := s.stageRepo.FindByID(tenantID, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("stage not found")
		}
		return nil, err
	}
	return stage, nil
}

func (s *pipelineStageService) CreateStage(stage *model.PipelineStage) error {
	// Validate stage name
	if stage.Name == "" {
		return errors.New("stage name is required")
	}

	// Validate probability range
	if stage.Probability < 0 || stage.Probability > 100 {
		return errors.New("probability must be between 0 and 100")
	}

	// Set default color if not provided
	if stage.Color == "" {
		stage.Color = "#3B82F6"
	}

	return s.stageRepo.Create(stage)
}

func (s *pipelineStageService) UpdateStage(tenantID uint, stage *model.PipelineStage) error {
	// Verify stage exists and belongs to tenant
	existing, err := s.stageRepo.FindByID(tenantID, stage.ID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("stage not found")
		}
		return err
	}

	// Preserve immutable fields
	stage.TenantID = existing.TenantID

	// Validate probability if being updated
	if stage.Probability < 0 || stage.Probability > 100 {
		return errors.New("probability must be between 0 and 100")
	}

	return s.stageRepo.Update(stage)
}

func (s *pipelineStageService) DeleteStage(tenantID, id uint) error {
	// Verify stage exists
	_, err := s.stageRepo.FindByID(tenantID, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("stage not found")
		}
		return err
	}

	// Check if stage has deals
	dealsCount, err := s.stageRepo.CountDealsByStage(tenantID, id)
	if err != nil {
		return err
	}

	if dealsCount > 0 {
		return errors.New("cannot delete stage with existing deals")
	}

	return s.stageRepo.Delete(tenantID, id)
}

func (s *pipelineStageService) ReorderStages(tenantID uint, stageIDs []uint) error {
	// Validate that all stage IDs exist and belong to tenant
	for _, stageID := range stageIDs {
		_, err := s.stageRepo.FindByID(tenantID, stageID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errors.New("one or more stages not found")
			}
			return err
		}
	}

	return s.stageRepo.Reorder(tenantID, stageIDs)
}
