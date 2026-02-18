package repository

import (
	"gin-quickstart/internal/model"

	"gorm.io/gorm"
)

type AuditLogRepository interface {
	Create(log *model.AuditLog) error
	FindByTenant(tenantID uint, page, pageSize int) ([]model.AuditLog, int64, error)
	FindByUser(tenantID, userID uint, page, pageSize int) ([]model.AuditLog, int64, error)
}

type auditLogRepository struct {
	db *gorm.DB
}

func NewAuditLogRepository(db *gorm.DB) AuditLogRepository {
	return &auditLogRepository{db: db}
}

func (r *auditLogRepository) Create(log *model.AuditLog) error {
	return r.db.Create(log).Error
}

// FindByTenant with optimized indexing and pagination
func (r *auditLogRepository) FindByTenant(tenantID uint, page, pageSize int) ([]model.AuditLog, int64, error) {
	var logs []model.AuditLog
	var total int64

	if err := r.db.Model(&model.AuditLog{}).
		Scopes(model.TenantScope(tenantID)).
		Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := r.db.Scopes(
		model.TenantScope(tenantID),
		model.Paginate(page, pageSize),
		model.OrderByCreatedAt(),
	).Find(&logs).Error

	return logs, total, err
}

// FindByUser fetches audit logs for specific user in tenant
func (r *auditLogRepository) FindByUser(tenantID, userID uint, page, pageSize int) ([]model.AuditLog, int64, error) {
	var logs []model.AuditLog
	var total int64

	query := r.db.Model(&model.AuditLog{}).
		Scopes(model.TenantScope(tenantID)).
		Where("user_id = ?", userID)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.Scopes(
		model.Paginate(page, pageSize),
		model.OrderByCreatedAt(),
	).Find(&logs).Error

	return logs, total, err
}
