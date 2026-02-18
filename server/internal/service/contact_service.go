package service

import (
	"errors"
	"gin-quickstart/internal/model"
	"gin-quickstart/internal/repository"

	"gorm.io/gorm"
)

type ContactService interface {
	CreateContact(contact *model.Contact) error
	GetContact(tenantID, id uint) (*model.Contact, error)
	GetContacts(tenantID uint, filter *model.ContactFilter, page, pageSize int) ([]model.Contact, int64, error)
	UpdateContact(tenantID uint, contact *model.Contact) error
	DeleteContact(tenantID, id uint) error
	SearchContacts(tenantID uint, query string, page, pageSize int) ([]model.Contact, int64, error)
}

type contactService struct {
	contactRepo  repository.ContactRepository
	auditLogRepo repository.AuditLogRepository
}

func NewContactService(
	contactRepo repository.ContactRepository,
	auditLogRepo repository.AuditLogRepository,
) ContactService {
	return &contactService{
		contactRepo:  contactRepo,
		auditLogRepo: auditLogRepo,
	}
}

func (s *contactService) CreateContact(contact *model.Contact) error {
	// Validate required fields
	if contact.FirstName == "" {
		return errors.New("first name is required")
	}

	// Set default status if not provided
	if contact.Status == "" {
		contact.Status = "active"
	}

	// Validate status
	validStatuses := map[string]bool{"active": true, "inactive": true, "blocked": true}
	if !validStatuses[contact.Status] {
		return errors.New("invalid status. must be: active, inactive, or blocked")
	}

	return s.contactRepo.Create(contact)
}

func (s *contactService) GetContact(tenantID, id uint) (*model.Contact, error) {
	contact, err := s.contactRepo.FindByID(tenantID, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("contact not found")
		}
		return nil, err
	}
	return contact, nil
}

func (s *contactService) GetContacts(tenantID uint, filter *model.ContactFilter, page, pageSize int) ([]model.Contact, int64, error) {
	return s.contactRepo.FindAll(tenantID, filter, page, pageSize)
}

func (s *contactService) UpdateContact(tenantID uint, contact *model.Contact) error {
	// Verify contact exists and belongs to tenant
	existing, err := s.contactRepo.FindByID(tenantID, contact.ID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("contact not found")
		}
		return err
	}

	// Ensure tenant_id doesn't change
	contact.TenantID = existing.TenantID

	// Validate if status is being changed
	if contact.Status != "" {
		validStatuses := map[string]bool{"active": true, "inactive": true, "blocked": true}
		if !validStatuses[contact.Status] {
			return errors.New("invalid status")
		}
	}

	return s.contactRepo.Update(contact)
}

func (s *contactService) DeleteContact(tenantID, id uint) error {
	// Verify contact exists
	_, err := s.contactRepo.FindByID(tenantID, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("contact not found")
		}
		return err
	}

	return s.contactRepo.Delete(tenantID, id)
}

func (s *contactService) SearchContacts(tenantID uint, query string, page, pageSize int) ([]model.Contact, int64, error) {
	return s.contactRepo.Search(tenantID, query, page, pageSize)
}
