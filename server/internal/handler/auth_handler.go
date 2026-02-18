package handler

import (
	"gin-quickstart/internal/middleware"
	"gin-quickstart/internal/repository"
	"gin-quickstart/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService    service.AuthService
	tenantUserRepo repository.TenantUserRepository
}

func NewAuthHandler(authService service.AuthService, tenantUserRepo repository.TenantUserRepository) *AuthHandler {
	return &AuthHandler{
		authService:    authService,
		tenantUserRepo: tenantUserRepo,
	}
}

type RegisterRequest struct {
	Email      string `json:"email" binding:"required,email"`
	Password   string `json:"password" binding:"required,min=6"`
	FullName   string `json:"full_name" binding:"required"`
	TenantName string `json:"tenant_name" binding:"required"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
	TenantID uint   `json:"tenant_id"` // Optional: if user belongs to multiple tenants
}

// Register creates a new user and their tenant
func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create user
	user, err := h.authService.Register(req.Email, req.Password, req.FullName)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create tenant and associate user as admin
	tenant, err := h.authService.CreateTenantForUser(user.ID, req.TenantName)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Generate JWT token
	token, err := middleware.GenerateToken(user.ID, tenant.ID, user.Email, "admin")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Registration successful",
		"user":    user,
		"tenant":  tenant,
		"token":   token,
	})
}

// Login authenticates a user
func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Authenticate user
	user, err := h.authService.Login(req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Get user's tenants
	tenantUsers, err := h.tenantUserRepo.FindTenantsByUser(user.ID)
	if err != nil || len(tenantUsers) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User not associated with any tenant"})
		return
	}

	// If tenant_id specified, use that; otherwise use first tenant
	var tenantID uint
	var role string

	if req.TenantID > 0 {
		// Verify user has access to specified tenant
		for _, tu := range tenantUsers {
			if tu.TenantID == req.TenantID {
				tenantID = tu.TenantID
				role = tu.Role
				break
			}
		}
		if tenantID == 0 {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access denied to specified tenant"})
			return
		}
	} else {
		// Use first tenant
		tenantID = tenantUsers[0].TenantID
		role = tenantUsers[0].Role
	}

	// Generate JWT token with tenant context
	token, err := middleware.GenerateToken(user.ID, tenantID, user.Email, role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":           "Login successful",
		"user":              user,
		"token":             token,
		"tenant_id":         tenantID,
		"role":              role,
		"available_tenants": tenantUsers,
	})
}

// GetMyTenants returns all tenants the authenticated user belongs to
func (h *AuthHandler) GetMyTenants(c *gin.Context) {
	userID := middleware.GetUserID(c)

	tenantUsers, err := h.tenantUserRepo.FindTenantsByUser(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tenants"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"tenants": tenantUsers,
	})
}

// SwitchTenant generates a new token for a different tenant
func (h *AuthHandler) SwitchTenant(c *gin.Context) {
	userID := middleware.GetUserID(c)
	tenantIDStr := c.Param("tenant_id")
	tenantID, err := strconv.ParseUint(tenantIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tenant ID"})
		return
	}

	// Verify user has access to tenant
	if !h.tenantUserRepo.CheckUserAccess(uint(tenantID), userID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied to this tenant"})
		return
	}

	tenantUser, err := h.tenantUserRepo.FindByTenantAndUser(uint(tenantID), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tenant access"})
		return
	}

	email, _ := c.Get("email")
	token, err := middleware.GenerateToken(userID, uint(tenantID), email.(string), tenantUser.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":   "Tenant switched successfully",
		"token":     token,
		"tenant_id": tenantID,
		"role":      tenantUser.Role,
	})
}
