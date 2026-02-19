package handler

import (
	"gin-quickstart/internal/middleware"
	"gin-quickstart/internal/model"
	"gin-quickstart/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type PipelineStageHandler struct {
	stageService service.PipelineStageService
	auditService service.AuditService
}

func NewPipelineStageHandler(stageService service.PipelineStageService, auditService service.AuditService) *PipelineStageHandler {
	return &PipelineStageHandler{
		stageService: stageService,
		auditService: auditService,
	}
}

// GetStages returns all pipeline stages (creates defaults if none exist)
func (h *PipelineStageHandler) GetStages(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)

	stages, err := h.stageService.GetStages(tenantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch pipeline stages"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"stages": stages,
		"total":  len(stages),
	})
}

// GetStage returns a single stage by ID
func (h *PipelineStageHandler) GetStage(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid stage ID"})
		return
	}

	stage, err := h.stageService.GetStageByID(tenantID, uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"stage": stage})
}

// CreateStage creates a new custom pipeline stage
func (h *PipelineStageHandler) CreateStage(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	userID := middleware.GetUserID(c)

	var req model.PipelineStage
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set tenant
	req.TenantID = tenantID
	req.IsDefault = false // Custom stage

	if err := h.stageService.CreateStage(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Log audit
	h.auditService.Log(&model.AuditLog{
		TenantID:   tenantID,
		UserID:     userID,
		Action:     "create",
		Resource:   "pipeline_stage",
		ResourceID: req.ID,
		IPAddress:  c.ClientIP(),
		UserAgent:  c.GetHeader("User-Agent"),
	})

	c.JSON(http.StatusCreated, gin.H{
		"message": "Stage created successfully",
		"stage":   req,
	})
}

// UpdateStage updates an existing pipeline stage
func (h *PipelineStageHandler) UpdateStage(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	userID := middleware.GetUserID(c)
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid stage ID"})
		return
	}

	var req model.PipelineStage
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	req.ID = uint(id)
	if err := h.stageService.UpdateStage(tenantID, &req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Log audit
	h.auditService.Log(&model.AuditLog{
		TenantID:   tenantID,
		UserID:     userID,
		Action:     "update",
		Resource:   "pipeline_stage",
		ResourceID: uint(id),
		IPAddress:  c.ClientIP(),
		UserAgent:  c.GetHeader("User-Agent"),
	})

	c.JSON(http.StatusOK, gin.H{
		"message": "Stage updated successfully",
		"stage":   req,
	})
}

// DeleteStage deletes a pipeline stage (only if no deals)
func (h *PipelineStageHandler) DeleteStage(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	userID := middleware.GetUserID(c)
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid stage ID"})
		return
	}

	if err := h.stageService.DeleteStage(tenantID, uint(id)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Log audit
	h.auditService.Log(&model.AuditLog{
		TenantID:   tenantID,
		UserID:     userID,
		Action:     "delete",
		Resource:   "pipeline_stage",
		ResourceID: uint(id),
		IPAddress:  c.ClientIP(),
		UserAgent:  c.GetHeader("User-Agent"),
	})

	c.JSON(http.StatusOK, gin.H{"message": "Stage deleted successfully"})
}

// ReorderStages updates the display order of stages
func (h *PipelineStageHandler) ReorderStages(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	userID := middleware.GetUserID(c)

	var req struct {
		StageIDs []uint `json:"stage_ids" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if len(req.StageIDs) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "stage_ids cannot be empty"})
		return
	}

	if err := h.stageService.ReorderStages(tenantID, req.StageIDs); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Log audit
	h.auditService.Log(&model.AuditLog{
		TenantID:  tenantID,
		UserID:    userID,
		Action:    "reorder",
		Resource:  "pipeline_stage",
		IPAddress: c.ClientIP(),
		UserAgent: c.GetHeader("User-Agent"),
	})

	c.JSON(http.StatusOK, gin.H{"message": "Stages reordered successfully"})
}
