package handler

import (
	"gin-quickstart/internal/middleware"
	"gin-quickstart/internal/model"
	"gin-quickstart/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type TenantHandler struct {
	tenantService service.TenantService
	auditService  service.AuditService
}

func NewTenantHandler(tenantService service.TenantService, auditService service.AuditService) *TenantHandler {
	return &TenantHandler{
		tenantService: tenantService,
		auditService:  auditService,
	}
}

// GetTenant returns current tenant info
func (h *TenantHandler) GetTenant(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)

	tenant, err := h.tenantService.GetTenantByID(tenantID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tenant not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"tenant": tenant})
}

// GetAllTenants returns all tenants (admin only)
func (h *TenantHandler) GetAllTenants(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	tenants, total, err := h.tenantService.GetAllTenants(page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tenants"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"tenants":   tenants,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

// UpdateTenant updates tenant information
func (h *TenantHandler) UpdateTenant(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)

	var updateReq struct {
		Name   string `json:"name"`
		Status string `json:"status"`
	}

	if err := c.ShouldBindJSON(&updateReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tenant, err := h.tenantService.GetTenantByID(tenantID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tenant not found"})
		return
	}

	if updateReq.Name != "" {
		tenant.Name = updateReq.Name
	}
	if updateReq.Status != "" {
		tenant.Status = updateReq.Status
	}

	if err := h.tenantService.UpdateTenant(tenant); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update tenant"})
		return
	}

	// Log audit
	h.auditService.Log(&model.AuditLog{
		TenantID:   tenantID,
		UserID:     middleware.GetUserID(c),
		Action:     "update",
		Resource:   "tenant",
		ResourceID: tenantID,
		IPAddress:  c.ClientIP(),
		UserAgent:  c.GetHeader("User-Agent"),
	})

	c.JSON(http.StatusOK, gin.H{"message": "Tenant updated successfully", "tenant": tenant})
}

// GetTenantUsers returns users in the tenant
func (h *TenantHandler) GetTenantUsers(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	users, total, err := h.tenantService.GetTenantUsers(tenantID, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"users":     users,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

// AddUser creates a new user or adds existing user to tenant
func (h *TenantHandler) AddUser(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)

	var req struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password"` // Optional if user exists
		FullName string `json:"full_name"`
		Role     string `json:"role" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, isNewUser, err := h.tenantService.AddUser(tenantID, req.Email, req.Password, req.FullName, req.Role)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Log audit
	action := "add_user"
	if isNewUser {
		action = "create_user"
	}

	h.auditService.Log(&model.AuditLog{
		TenantID:   tenantID,
		UserID:     middleware.GetUserID(c),
		Action:     action,
		Resource:   "user",
		ResourceID: user.ID,
		IPAddress:  c.ClientIP(),
		UserAgent:  c.GetHeader("User-Agent"),
	})

	message := "User added to tenant successfully"
	if isNewUser {
		message = "User created and added to tenant successfully"
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":     message,
		"user":        user,
		"is_new_user": isNewUser,
	})
}

// UpdateUserRole updates a user's role in the tenant
func (h *TenantHandler) UpdateUserRole(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	userIDStr := c.Param("user_id")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var req struct {
		Role string `json:"role" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.tenantService.UpdateUserRole(tenantID, uint(userID), req.Role); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update role"})
		return
	}

	// Log audit
	h.auditService.Log(&model.AuditLog{
		TenantID:   tenantID,
		UserID:     middleware.GetUserID(c),
		Action:     "update_role",
		Resource:   "user",
		ResourceID: uint(userID),
		IPAddress:  c.ClientIP(),
		UserAgent:  c.GetHeader("User-Agent"),
	})

	c.JSON(http.StatusOK, gin.H{"message": "User role updated successfully"})
}

// RemoveUser removes a user from the tenant
func (h *TenantHandler) RemoveUser(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	userIDStr := c.Param("user_id")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	if err := h.tenantService.RemoveUserFromTenant(tenantID, uint(userID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove user"})
		return
	}

	// Log audit
	h.auditService.Log(&model.AuditLog{
		TenantID:   tenantID,
		UserID:     middleware.GetUserID(c),
		Action:     "remove",
		Resource:   "user",
		ResourceID: uint(userID),
		IPAddress:  c.ClientIP(),
		UserAgent:  c.GetHeader("User-Agent"),
	})

	c.JSON(http.StatusOK, gin.H{"message": "User removed successfully"})
}

// GetAuditLogs returns audit logs for the tenant
func (h *TenantHandler) GetAuditLogs(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	logs, total, err := h.auditService.GetTenantLogs(tenantID, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch audit logs"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"logs":      logs,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}
