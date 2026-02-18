package service

import (
	"gin-quickstart/internal/model"
	"gin-quickstart/internal/repository"
)

type TenantService interface {
	GetTenantByID(id uint) (*model.Tenant, error)
	GetAllTenants(page, pageSize int) ([]model.Tenant, int64, error)
	UpdateTenant(tenant *model.Tenant) error
	DeleteTenant(id uint) error
	GetTenantUsers(tenantID uint, page, pageSize int) ([]model.TenantUser, int64, error)
	RemoveUserFromTenant(tenantID, userID uint) error
	UpdateUserRole(tenantID, userID uint, role string) error
}

type tenantService struct {
	tenantRepo     repository.TenantRepository
	tenantUserRepo repository.TenantUserRepository
	auditLogRepo   repository.AuditLogRepository
}

func NewTenantService(
	tenantRepo repository.TenantRepository,
	tenantUserRepo repository.TenantUserRepository,
	auditLogRepo repository.AuditLogRepository,
) TenantService {
	return &tenantService{
		tenantRepo:     tenantRepo,
		tenantUserRepo: tenantUserRepo,
		auditLogRepo:   auditLogRepo,
	}
}

func (s *tenantService) GetTenantByID(id uint) (*model.Tenant, error) {
	return s.tenantRepo.FindByID(id)
}

func (s *tenantService) GetAllTenants(page, pageSize int) ([]model.Tenant, int64, error) {
	return s.tenantRepo.FindAll(page, pageSize)
}

func (s *tenantService) UpdateTenant(tenant *model.Tenant) error {
	return s.tenantRepo.Update(tenant)
}

func (s *tenantService) DeleteTenant(id uint) error {
	return s.tenantRepo.Delete(id)
}

func (s *tenantService) GetTenantUsers(tenantID uint, page, pageSize int) ([]model.TenantUser, int64, error) {
	return s.tenantUserRepo.FindUsersByTenant(tenantID, page, pageSize)
}

func (s *tenantService) RemoveUserFromTenant(tenantID, userID uint) error {
	return s.tenantUserRepo.Delete(tenantID, userID)
}

func (s *tenantService) UpdateUserRole(tenantID, userID uint, role string) error {
	return s.tenantUserRepo.UpdateRole(tenantID, userID, role)
}
