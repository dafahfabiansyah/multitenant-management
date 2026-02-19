package service

import (
	"errors"
	"gin-quickstart/internal/model"
	"gin-quickstart/internal/repository"
)

type DealService struct {
	dealRepo    repository.DealRepository
	stageRepo   repository.PipelineStageRepository
	contactRepo repository.ContactRepository
}

func NewDealService(
	dealRepo repository.DealRepository,
	stageRepo repository.PipelineStageRepository,
	contactRepo repository.ContactRepository,
) *DealService {
	return &DealService{
		dealRepo:    dealRepo,
		stageRepo:   stageRepo,
		contactRepo: contactRepo,
	}
}

// GetDeals returns all deals with filters
func (s *DealService) GetDeals(tenantID uint, filter repository.DealFilter) ([]model.Deal, int64, error) {
	deals, err := s.dealRepo.FindAll(tenantID, filter)
	if err != nil {
		return nil, 0, err
	}

	count, err := s.dealRepo.Count(tenantID, filter)
	if err != nil {
		return deals, 0, err
	}

	return deals, count, nil
}

// GetDealByID returns a single deal by ID
func (s *DealService) GetDealByID(tenantID uint, id uint) (*model.Deal, error) {
	deal, err := s.dealRepo.FindByID(tenantID, id)
	if err != nil {
		return nil, errors.New("deal not found")
	}
	return deal, nil
}

// CreateDeal creates a new deal
func (s *DealService) CreateDeal(deal *model.Deal) error {
	// Validate required fields
	if deal.Title == "" {
		return errors.New("deal title is required")
	}

	// Validate stage exists
	if deal.StageID == 0 {
		return errors.New("stage_id is required")
	}

	stage, err := s.stageRepo.FindByID(deal.TenantID, deal.StageID)
	if err != nil {
		return errors.New("invalid stage_id: stage not found")
	}

	// Validate contact if provided
	if deal.ContactID > 0 {
		_, err := s.contactRepo.FindByID(deal.TenantID, deal.ContactID)
		if err != nil {
			return errors.New("invalid contact_id: contact not found")
		}
	}

	// Set probability from stage if not provided
	if deal.Probability == 0 {
		deal.Probability = stage.Probability
	}

	// Set default status if not provided
	if deal.Status == "" {
		deal.Status = "active"
	}

	return s.dealRepo.Create(deal)
}

// UpdateDeal updates a deal
func (s *DealService) UpdateDeal(tenantID uint, deal *model.Deal) error {
	// Check if deal exists
	existing, err := s.dealRepo.FindByID(tenantID, deal.ID)
	if err != nil {
		return errors.New("deal not found")
	}

	// Validate title if provided
	if deal.Title != "" && deal.Title != existing.Title {
		// Title is being updated
	}

	// Validate stage if provided
	if deal.StageID != 0 && deal.StageID != existing.StageID {
		stage, err := s.stageRepo.FindByID(tenantID, deal.StageID)
		if err != nil {
			return errors.New("invalid stage_id: stage not found")
		}
		// Update probability based on new stage
		if deal.Probability == 0 || deal.Probability == existing.Probability {
			deal.Probability = stage.Probability
		}
	}

	// Validate contact if provided
	if deal.ContactID > 0 && deal.ContactID != existing.ContactID {
		_, err := s.contactRepo.FindByID(tenantID, deal.ContactID)
		if err != nil {
			return errors.New("invalid contact_id: contact not found")
		}
	}

	return s.dealRepo.Update(deal)
}

// DeleteDeal deletes a deal
func (s *DealService) DeleteDeal(tenantID uint, id uint) error {
	deal, err := s.dealRepo.FindByID(tenantID, id)
	if err != nil {
		return errors.New("deal not found")
	}

	return s.dealRepo.Delete(deal)
}

// MoveToStage moves a deal to a different stage
func (s *DealService) MoveToStage(tenantID uint, dealID uint, newStageID uint) (*model.Deal, error) {
	// Verify deal exists
	_, err := s.dealRepo.FindByID(tenantID, dealID)
	if err != nil {
		return nil, errors.New("deal not found")
	}

	// Verify new stage exists
	newStage, err := s.stageRepo.FindByID(tenantID, newStageID)
	if err != nil {
		return nil, errors.New("invalid stage_id: stage not found")
	}

	// Prepare updates map
	updates := map[string]interface{}{
		"stage_id":    newStageID,
		"probability": newStage.Probability,
	}

	// Update status based on stage terminal flags
	if newStage.IsClosedWon {
		updates["status"] = "won"
	} else if newStage.IsClosedLost {
		updates["status"] = "lost"
	}

	// Update all fields in one query using map
	if err := s.dealRepo.UpdateFields(tenantID, dealID, updates); err != nil {
		return nil, err
	}

	// Fetch updated deal with preloaded relations
	return s.dealRepo.FindByID(tenantID, dealID)
}

// UpdateStatus updates deal status
func (s *DealService) UpdateStatus(tenantID uint, dealID uint, status string) error {
	// Validate status
	validStatuses := []string{"active", "won", "lost", "cancelled"}
	isValid := false
	for _, validStatus := range validStatuses {
		if status == validStatus {
			isValid = true
			break
		}
	}

	if !isValid {
		return errors.New("invalid status: must be one of active, won, lost, cancelled")
	}

	// Verify deal exists
	_, err := s.dealRepo.FindByID(tenantID, dealID)
	if err != nil {
		return errors.New("deal not found")
	}

	return s.dealRepo.UpdateStatus(tenantID, dealID, status)
}

// GetPipelineValue returns total value of deals by stage
func (s *DealService) GetPipelineValue(tenantID uint) (map[uint]float64, error) {
	return s.dealRepo.GetTotalValueByStage(tenantID)
}
