package handler

import (
	"gin-quickstart/internal/middleware"
	"gin-quickstart/internal/model"
	"gin-quickstart/internal/service"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

type ContactHandler struct {
	contactService service.ContactService
	auditService   service.AuditService
}

func NewContactHandler(contactService service.ContactService, auditService service.AuditService) *ContactHandler {
	return &ContactHandler{
		contactService: contactService,
		auditService:   auditService,
	}
}

// CreateContact creates a new contact
func (h *ContactHandler) CreateContact(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	userID := middleware.GetUserID(c)

	var req model.Contact
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set tenant and creator
	req.TenantID = tenantID
	req.CreatedBy = userID

	if err := h.contactService.CreateContact(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Log audit
	h.auditService.Log(&model.AuditLog{
		TenantID:   tenantID,
		UserID:     userID,
		Action:     "create",
		Resource:   "contact",
		ResourceID: req.ID,
		IPAddress:  c.ClientIP(),
		UserAgent:  c.GetHeader("User-Agent"),
	})

	c.JSON(http.StatusCreated, gin.H{
		"message": "Contact created successfully",
		"contact": req,
	})
}

// GetContact returns a single contact by ID
func (h *ContactHandler) GetContact(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid contact ID"})
		return
	}

	contact, err := h.contactService.GetContact(tenantID, uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"contact": contact})
}

// GetContacts returns a list of contacts with filtering and pagination
func (h *ContactHandler) GetContacts(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)

	// Parse pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	// Parse filters
	filter := &model.ContactFilter{
		Search:   c.Query("search"),
		Status:   c.Query("status"),
		Source:   c.Query("source"),
		City:     c.Query("city"),
		Province: c.Query("province"),
	}

	// Parse tags (comma-separated)
	if tagsStr := c.Query("tags"); tagsStr != "" {
		filter.Tags = strings.Split(tagsStr, ",")
	}

	contacts, total, err := h.contactService.GetContacts(tenantID, filter, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch contacts"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"contacts":    contacts,
		"total":       total,
		"page":        page,
		"page_size":   pageSize,
		"total_pages": (total + int64(pageSize) - 1) / int64(pageSize),
	})
}

// UpdateContact updates an existing contact
func (h *ContactHandler) UpdateContact(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	userID := middleware.GetUserID(c)
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid contact ID"})
		return
	}

	var req model.Contact
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	req.ID = uint(id)
	if err := h.contactService.UpdateContact(tenantID, &req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Log audit
	h.auditService.Log(&model.AuditLog{
		TenantID:   tenantID,
		UserID:     userID,
		Action:     "update",
		Resource:   "contact",
		ResourceID: uint(id),
		IPAddress:  c.ClientIP(),
		UserAgent:  c.GetHeader("User-Agent"),
	})

	c.JSON(http.StatusOK, gin.H{
		"message": "Contact updated successfully",
		"contact": req,
	})
}

// DeleteContact deletes a contact (soft delete)
func (h *ContactHandler) DeleteContact(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	userID := middleware.GetUserID(c)
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid contact ID"})
		return
	}

	if err := h.contactService.DeleteContact(tenantID, uint(id)); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	// Log audit
	h.auditService.Log(&model.AuditLog{
		TenantID:   tenantID,
		UserID:     userID,
		Action:     "delete",
		Resource:   "contact",
		ResourceID: uint(id),
		IPAddress:  c.ClientIP(),
		UserAgent:  c.GetHeader("User-Agent"),
	})

	c.JSON(http.StatusOK, gin.H{"message": "Contact deleted successfully"})
}

// SearchContacts searches contacts by query
func (h *ContactHandler) SearchContacts(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	query := c.Query("q")

	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Search query is required"})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	contacts, total, err := h.contactService.SearchContacts(tenantID, query, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to search contacts"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"contacts":  contacts,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
		"query":     query,
	})
}
