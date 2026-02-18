package repository

import (
	"gin-quickstart/internal/model"

	"gorm.io/gorm"
)

type TenantUserRepository interface {
	Create(tenantUser *model.TenantUser) error
	FindByTenantAndUser(tenantID, userID uint) (*model.TenantUser, error)
	FindUsersByTenant(tenantID uint, page, pageSize int) ([]model.TenantUser, int64, error)
	FindTenantsByUser(userID uint) ([]model.TenantUser, error)
	UpdateRole(tenantID, userID uint, role string) error
	Delete(tenantID, userID uint) error
	CheckUserAccess(tenantID, userID uint) bool
}

type tenantUserRepository struct {
	db *gorm.DB
}

func NewTenantUserRepository(db *gorm.DB) TenantUserRepository {
	return &tenantUserRepository{db: db}
}

func (r *tenantUserRepository) Create(tenantUser *model.TenantUser) error {
	return r.db.Create(tenantUser).Error
}

// FindByTenantAndUser uses composite index for fast lookup
func (r *tenantUserRepository) FindByTenantAndUser(tenantID, userID uint) (*model.TenantUser, error) {
	var tenantUser model.TenantUser
	err := r.db.Where("tenant_id = ? AND user_id = ?", tenantID, userID).
		First(&tenantUser).Error
	if err != nil {
		return nil, err
	}
	return &tenantUser, nil
}

// FindUsersByTenant efficiently fetches users of a tenant with preloading
func (r *tenantUserRepository) FindUsersByTenant(tenantID uint, page, pageSize int) ([]model.TenantUser, int64, error) {
	var tenantUsers []model.TenantUser
	var total int64

	// Count with tenant scope
	if err := r.db.Model(&model.TenantUser{}).
		Scopes(model.TenantScope(tenantID)).
		Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Fetch with efficient preloading
	err := r.db.Scopes(
		model.TenantScope(tenantID),
		model.Paginate(page, pageSize),
		model.PreloadUser(),
	).Find(&tenantUsers).Error

	return tenantUsers, total, err
}

// FindTenantsByUser efficiently fetches all tenants a user belongs to
func (r *tenantUserRepository) FindTenantsByUser(userID uint) ([]model.TenantUser, error) {
	var tenantUsers []model.TenantUser
	err := r.db.Where("user_id = ?", userID).
		Scopes(model.PreloadTenant()).
		Find(&tenantUsers).Error

	return tenantUsers, err
}

func (r *tenantUserRepository) UpdateRole(tenantID, userID uint, role string) error {
	return r.db.Model(&model.TenantUser{}).
		Where("tenant_id = ? AND user_id = ?", tenantID, userID).
		Update("role", role).Error
}

func (r *tenantUserRepository) Delete(tenantID, userID uint) error {
	return r.db.Where("tenant_id = ? AND user_id = ?", tenantID, userID).
		Delete(&model.TenantUser{}).Error
}

// CheckUserAccess efficiently checks if user has access to tenant using indexed fields
func (r *tenantUserRepository) CheckUserAccess(tenantID, userID uint) bool {
	var count int64
	r.db.Model(&model.TenantUser{}).
		Where("tenant_id = ? AND user_id = ?", tenantID, userID).
		Count(&count)
	return count > 0
}
