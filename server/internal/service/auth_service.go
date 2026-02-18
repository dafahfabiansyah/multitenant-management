package service

import (
	"errors"
	"gin-quickstart/internal/model"
	"gin-quickstart/internal/repository"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthService interface {
	Register(email, password, fullName string) (*model.User, error)
	Login(email, password string) (*model.User, error)
	CreateTenantForUser(userID uint, tenantName string) (*model.Tenant, error)
	AddUserToTenant(tenantID, userID uint, role string) error
}

type authService struct {
	userRepo       repository.UserRepository
	tenantRepo     repository.TenantRepository
	tenantUserRepo repository.TenantUserRepository
}

func NewAuthService(
	userRepo repository.UserRepository,
	tenantRepo repository.TenantRepository,
	tenantUserRepo repository.TenantUserRepository,
) AuthService {
	return &authService{
		userRepo:       userRepo,
		tenantRepo:     tenantRepo,
		tenantUserRepo: tenantUserRepo,
	}
}

func (s *authService) Register(email, password, fullName string) (*model.User, error) {
	// Check if user already exists
	existingUser, err := s.userRepo.FindByEmail(email)
	if err == nil && existingUser != nil {
		return nil, errors.New("user with this email already exists")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &model.User{
		Email:        email,
		PasswordHash: string(hashedPassword),
		FullName:     fullName,
		IsActive:     true,
	}

	if err := s.userRepo.Create(user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *authService) Login(email, password string) (*model.User, error) {
	user, err := s.userRepo.FindByEmail(email)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("invalid email or password")
		}
		return nil, err
	}

	if !user.IsActive {
		return nil, errors.New("user account is inactive")
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, errors.New("invalid email or password")
	}

	return user, nil
}

func (s *authService) CreateTenantForUser(userID uint, tenantName string) (*model.Tenant, error) {
	tenant := &model.Tenant{
		Name:   tenantName,
		Status: "active",
	}

	if err := s.tenantRepo.Create(tenant); err != nil {
		return nil, err
	}

	// Add user as admin of the new tenant
	tenantUser := &model.TenantUser{
		TenantID: tenant.ID,
		UserID:   userID,
		Role:     "admin",
	}

	if err := s.tenantUserRepo.Create(tenantUser); err != nil {
		// Rollback tenant creation if failed to add user
		s.tenantRepo.Delete(tenant.ID)
		return nil, err
	}

	return tenant, nil
}

func (s *authService) AddUserToTenant(tenantID, userID uint, role string) error {
	// Check if relationship already exists
	existing, _ := s.tenantUserRepo.FindByTenantAndUser(tenantID, userID)
	if existing != nil {
		return errors.New("user already belongs to this tenant")
	}

	tenantUser := &model.TenantUser{
		TenantID: tenantID,
		UserID:   userID,
		Role:     role,
	}

	return s.tenantUserRepo.Create(tenantUser)
}
