package repository

import (
	"gin-quickstart/internal/model"
	"strings"

	"gorm.io/gorm"
)

type ContactRepository interface {
	Create(contact *model.Contact) error
	FindByID(tenantID, id uint) (*model.Contact, error)
	FindAll(tenantID uint, filter *model.ContactFilter, page, pageSize int) ([]model.Contact, int64, error)
	Update(contact *model.Contact) error
	Delete(tenantID, id uint) error
	Search(tenantID uint, query string, page, pageSize int) ([]model.Contact, int64, error)
}

type contactRepository struct {
	db *gorm.DB
}

func NewContactRepository(db *gorm.DB) ContactRepository {
	return &contactRepository{db: db}
}

func (r *contactRepository) Create(contact *model.Contact) error {
	return r.db.Create(contact).Error
}

func (r *contactRepository) FindByID(tenantID, id uint) (*model.Contact, error) {
	var contact model.Contact
	err := r.db.Scopes(model.TenantScope(tenantID)).
		First(&contact, id).Error
	if err != nil {
		return nil, err
	}
	return &contact, nil
}

// FindAll with advanced filtering
func (r *contactRepository) FindAll(tenantID uint, filter *model.ContactFilter, page, pageSize int) ([]model.Contact, int64, error) {
	var contacts []model.Contact
	var total int64

	// Build query with filters
	query := r.db.Model(&model.Contact{}).Scopes(model.TenantScope(tenantID))

	// Apply filters
	if filter != nil {
		if filter.Search != "" {
			searchPattern := "%" + strings.ToLower(filter.Search) + "%"
			query = query.Where(
				"LOWER(first_name) LIKE ? OR LOWER(last_name) LIKE ? OR LOWER(email) LIKE ? OR LOWER(phone) LIKE ? OR LOWER(company_name) LIKE ?",
				searchPattern, searchPattern, searchPattern, searchPattern, searchPattern,
			)
		}

		if filter.Status != "" {
			query = query.Where("status = ?", filter.Status)
		}

		if filter.Source != "" {
			query = query.Where("source = ?", filter.Source)
		}

		if filter.City != "" {
			query = query.Where("city = ?", filter.City)
		}

		if filter.Province != "" {
			query = query.Where("province = ?", filter.Province)
		}

		// Tag filtering (simple LIKE for JSON array as string)
		if len(filter.Tags) > 0 {
			for _, tag := range filter.Tags {
				query = query.Where("tags LIKE ?", "%"+tag+"%")
			}
		}
	}

	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated results with ordering
	err := query.Scopes(model.Paginate(page, pageSize)).
		Order("first_name ASC, last_name ASC").
		Find(&contacts).Error

	return contacts, total, err
}

func (r *contactRepository) Update(contact *model.Contact) error {
	return r.db.Save(contact).Error
}

// Delete performs soft delete
func (r *contactRepository) Delete(tenantID, id uint) error {
	return r.db.Scopes(model.TenantScope(tenantID)).
		Delete(&model.Contact{}, id).Error
}

// Search is a shorthand for FindAll with search filter
func (r *contactRepository) Search(tenantID uint, query string, page, pageSize int) ([]model.Contact, int64, error) {
	filter := &model.ContactFilter{
		Search: query,
	}
	return r.FindAll(tenantID, filter, page, pageSize)
}
