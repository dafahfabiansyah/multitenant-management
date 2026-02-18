package service

import (
	"gin-quickstart/internal/model"
	"gin-quickstart/internal/repository"
)

type AuditService interface {
	Log(log *model.AuditLog) error
	GetTenantLogs(tenantID uint, page, pageSize int) ([]model.AuditLog, int64, error)
	GetUserLogs(tenantID, userID uint, page, pageSize int) ([]model.AuditLog, int64, error)
}

type auditService struct {
	auditLogRepo repository.AuditLogRepository
}

func NewAuditService(auditLogRepo repository.AuditLogRepository) AuditService {
	return &auditService{
		auditLogRepo: auditLogRepo,
	}
}

func (s *auditService) Log(log *model.AuditLog) error {
	return s.auditLogRepo.Create(log)
}

func (s *auditService) GetTenantLogs(tenantID uint, page, pageSize int) ([]model.AuditLog, int64, error) {
	return s.auditLogRepo.FindByTenant(tenantID, page, pageSize)
}

func (s *auditService) GetUserLogs(tenantID, userID uint, page, pageSize int) ([]model.AuditLog, int64, error) {
	return s.auditLogRepo.FindByUser(tenantID, userID, page, pageSize)
}
