package repository

import (
	"gin-quickstart/internal/model"

	"gorm.io/gorm"
)

type TenantRepository interface {
	Create(tenant *model.Tenant) error
	FindByID(id uint) (*model.Tenant, error)
	FindAll(page, pageSize int) ([]model.Tenant, int64, error)
	Update(tenant *model.Tenant) error
	Delete(id uint) error
}

type tenantRepository struct {
	db *gorm.DB
}

func NewTenantRepository(db *gorm.DB) TenantRepository {
	return &tenantRepository{db: db}
}

func (r *tenantRepository) Create(tenant *model.Tenant) error {
	return r.db.Create(tenant).Error
}

func (r *tenantRepository) FindByID(id uint) (*model.Tenant, error) {
	var tenant model.Tenant
	err := r.db.First(&tenant, id).Error
	if err != nil {
		return nil, err
	}
	return &tenant, nil
}

// FindAll with efficient pagination
func (r *tenantRepository) FindAll(page, pageSize int) ([]model.Tenant, int64, error) {
	var tenants []model.Tenant
	var total int64

	// Count total (optimized with indexed fields)
	if err := r.db.Model(&model.Tenant{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated results
	err := r.db.Scopes(model.Paginate(page, pageSize), model.OrderByCreatedAt()).
		Find(&tenants).Error

	return tenants, total, err
}

func (r *tenantRepository) Update(tenant *model.Tenant) error {
	return r.db.Save(tenant).Error
}

func (r *tenantRepository) Delete(id uint) error {
	return r.db.Delete(&model.Tenant{}, id).Error
}
