package handler

import (
	"gin-quickstart/internal/middleware"
	"gin-quickstart/internal/model"
	"gin-quickstart/internal/repository"
	"gin-quickstart/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type DealHandler struct {
	dealService  *service.DealService
	auditService service.AuditService
}

func NewDealHandler(dealService *service.DealService, auditService service.AuditService) *DealHandler {
	return &DealHandler{
		dealService:  dealService,
		auditService: auditService,
	}
}

// GetDeals returns all deals with filters
func (h *DealHandler) GetDeals(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)

	// Build filter from query parameters
	filter := repository.DealFilter{}

	// Stage filter
	if stageIDStr := c.Query("stage_id"); stageIDStr != "" {
		if stageID, err := strconv.ParseUint(stageIDStr, 10, 32); err == nil {
			stageIDUint := uint(stageID)
			filter.StageID = &stageIDUint
		}
	}

	// Status filter
	if status := c.Query("status"); status != "" {
		filter.Status = status
	}

	// Contact filter
	if contactIDStr := c.Query("contact_id"); contactIDStr != "" {
		if contactID, err := strconv.ParseUint(contactIDStr, 10, 32); err == nil {
			contactIDUint := uint(contactID)
			filter.ContactID = &contactIDUint
		}
	}

	// Value range filters
	if minValueStr := c.Query("min_value"); minValueStr != "" {
		if minValue, err := strconv.ParseFloat(minValueStr, 64); err == nil {
			filter.MinValue = &minValue
		}
	}
	if maxValueStr := c.Query("max_value"); maxValueStr != "" {
		if maxValue, err := strconv.ParseFloat(maxValueStr, 64); err == nil {
			filter.MaxValue = &maxValue
		}
	}

	// Expected close date range
	if startDate := c.Query("expected_close_start"); startDate != "" {
		filter.ExpectedCloseStart = &startDate
	}
	if endDate := c.Query("expected_close_end"); endDate != "" {
		filter.ExpectedCloseEnd = &endDate
	}

	// Search
	filter.Search = c.Query("search")

	// Sorting
	filter.SortBy = c.DefaultQuery("sort_by", "created_at")
	filter.SortOrder = c.DefaultQuery("sort_order", "desc")

	// Pagination
	if limitStr := c.Query("limit"); limitStr != "" {
		if limit, err := strconv.Atoi(limitStr); err == nil {
			filter.Limit = limit
		}
	} else {
		filter.Limit = 20 // Default limit
	}

	if offsetStr := c.Query("offset"); offsetStr != "" {
		if offset, err := strconv.Atoi(offsetStr); err == nil {
			filter.Offset = offset
		}
	}

	// Get deals
	deals, total, err := h.dealService.GetDeals(tenantID, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch deals"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"deals":  deals,
		"total":  total,
		"limit":  filter.Limit,
		"offset": filter.Offset,
	})
}

// GetDeal returns a single deal by ID
func (h *DealHandler) GetDeal(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid deal ID"})
		return
	}

	deal, err := h.dealService.GetDealByID(tenantID, uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"deal": deal})
}

// CreateDeal creates a new deal
func (h *DealHandler) CreateDeal(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	userID := middleware.GetUserID(c)

	var req model.Deal
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set tenant and creator
	req.TenantID = tenantID
	req.CreatedBy = userID

	if err := h.dealService.CreateDeal(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Log audit
	h.auditService.Log(&model.AuditLog{
		TenantID:   tenantID,
		UserID:     userID,
		Action:     "create",
		Resource:   "deal",
		ResourceID: req.ID,
		IPAddress:  c.ClientIP(),
		UserAgent:  c.GetHeader("User-Agent"),
	})

	c.JSON(http.StatusCreated, gin.H{
		"message": "Deal created successfully",
		"deal":    req,
	})
}

// UpdateDeal updates an existing deal
func (h *DealHandler) UpdateDeal(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	userID := middleware.GetUserID(c)
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid deal ID"})
		return
	}

	var req model.Deal
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	req.ID = uint(id)
	if err := h.dealService.UpdateDeal(tenantID, &req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Log audit
	h.auditService.Log(&model.AuditLog{
		TenantID:   tenantID,
		UserID:     userID,
		Action:     "update",
		Resource:   "deal",
		ResourceID: uint(id),
		IPAddress:  c.ClientIP(),
		UserAgent:  c.GetHeader("User-Agent"),
	})

	c.JSON(http.StatusOK, gin.H{
		"message": "Deal updated successfully",
		"deal":    req,
	})
}

// DeleteDeal deletes a deal
func (h *DealHandler) DeleteDeal(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	userID := middleware.GetUserID(c)
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid deal ID"})
		return
	}

	if err := h.dealService.DeleteDeal(tenantID, uint(id)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Log audit
	h.auditService.Log(&model.AuditLog{
		TenantID:   tenantID,
		UserID:     userID,
		Action:     "delete",
		Resource:   "deal",
		ResourceID: uint(id),
		IPAddress:  c.ClientIP(),
		UserAgent:  c.GetHeader("User-Agent"),
	})

	c.JSON(http.StatusOK, gin.H{"message": "Deal deleted successfully"})
}

// MoveToStage moves a deal to a different stage
func (h *DealHandler) MoveToStage(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	userID := middleware.GetUserID(c)
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid deal ID"})
		return
	}

	var req struct {
		StageID uint `json:"stage_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	deal, err := h.dealService.MoveToStage(tenantID, uint(id), req.StageID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Log audit
	h.auditService.Log(&model.AuditLog{
		TenantID:   tenantID,
		UserID:     userID,
		Action:     "move_stage",
		Resource:   "deal",
		ResourceID: uint(id),
		IPAddress:  c.ClientIP(),
		UserAgent:  c.GetHeader("User-Agent"),
	})

	c.JSON(http.StatusOK, gin.H{
		"message": "Deal moved successfully",
		"deal":    deal,
	})
}

// UpdateStatus updates deal status
func (h *DealHandler) UpdateStatus(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	userID := middleware.GetUserID(c)
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid deal ID"})
		return
	}

	var req struct {
		Status string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.dealService.UpdateStatus(tenantID, uint(id), req.Status); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Log audit
	h.auditService.Log(&model.AuditLog{
		TenantID:   tenantID,
		UserID:     userID,
		Action:     "update_status",
		Resource:   "deal",
		ResourceID: uint(id),
		IPAddress:  c.ClientIP(),
		UserAgent:  c.GetHeader("User-Agent"),
	})

	c.JSON(http.StatusOK, gin.H{"message": "Deal status updated successfully"})
}

// GetPipelineValue returns total value by stage
func (h *DealHandler) GetPipelineValue(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)

	values, err := h.dealService.GetPipelineValue(tenantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch pipeline values"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"pipeline_values": values})
}
