package service

import (
	"errors"
	"gin-quickstart/internal/model"
	"gin-quickstart/internal/repository"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type TenantService interface {
	GetTenantByID(id uint) (*model.Tenant, error)
	GetAllTenants(page, pageSize int) ([]model.Tenant, int64, error)
	UpdateTenant(tenant *model.Tenant) error
	DeleteTenant(id uint) error
	GetTenantUsers(tenantID uint, page, pageSize int) ([]model.TenantUser, int64, error)
	AddUser(tenantID uint, email, password, fullName, role string) (*model.User, bool, error)
	RemoveUserFromTenant(tenantID, userID uint) error
	UpdateUserRole(tenantID, userID uint, role string) error
}

type tenantService struct {
	tenantRepo     repository.TenantRepository
	userRepo       repository.UserRepository
	tenantUserRepo repository.TenantUserRepository
	auditLogRepo   repository.AuditLogRepository
}

func NewTenantService(
	tenantRepo repository.TenantRepository,
	userRepo repository.UserRepository,
	tenantUserRepo repository.TenantUserRepository,
	auditLogRepo repository.AuditLogRepository,
) TenantService {
	return &tenantService{
		tenantRepo:     tenantRepo,
		userRepo:       userRepo,
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

// AddUser creates a new user or adds existing user to tenant
// Returns: (user, isNewUser, error)
func (s *tenantService) AddUser(tenantID uint, email, password, fullName, role string) (*model.User, bool, error) {
	// Validate role
	validRoles := map[string]bool{"admin": true, "manager": true, "member": true}
	if !validRoles[role] {
		return nil, false, errors.New("invalid role. must be: admin, manager, or member")
	}

	// Check if user exists by email
	user, err := s.userRepo.FindByEmail(email)
	isNewUser := false

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// User doesn't exist, create new user
			if password == "" {
				return nil, false, errors.New("password is required for new user")
			}

			hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
			if err != nil {
				return nil, false, err
			}

			user = &model.User{
				Email:        email,
				PasswordHash: string(hashedPassword),
				FullName:     fullName,
				IsActive:     true,
			}

			if err := s.userRepo.Create(user); err != nil {
				return nil, false, err
			}
			isNewUser = true
		} else {
			// Database error
			return nil, false, err
		}
	}

	// Check if user already in tenant
	existingTenantUser, err := s.tenantUserRepo.FindByTenantAndUser(tenantID, user.ID)
	if err == nil && existingTenantUser != nil {
		return nil, false, errors.New("user already exists in this tenant")
	}

	// Add user to tenant
	tenantUser := &model.TenantUser{
		TenantID: tenantID,
		UserID:   user.ID,
		Role:     role,
	}

	if err := s.tenantUserRepo.Create(tenantUser); err != nil {
		return nil, false, err
	}

	return user, isNewUser, nil
}

func (s *tenantService) RemoveUserFromTenant(tenantID, userID uint) error {
	return s.tenantUserRepo.Delete(tenantID, userID)
}

func (s *tenantService) UpdateUserRole(tenantID, userID uint, role string) error {
	return s.tenantUserRepo.UpdateRole(tenantID, userID, role)
}
