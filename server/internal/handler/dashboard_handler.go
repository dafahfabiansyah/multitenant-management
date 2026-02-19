package handler

import (
	"gin-quickstart/internal/middleware"
	"gin-quickstart/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

type DashboardHandler struct {
	dashboardService service.DashboardService
}

func NewDashboardHandler(dashboardService service.DashboardService) *DashboardHandler {
	return &DashboardHandler{
		dashboardService: dashboardService,
	}
}

// GetStats returns dashboard statistics
func (h *DashboardHandler) GetStats(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)

	// Get period from query params (default: month)
	period := c.DefaultQuery("period", "month")

	// Validate period
	validPeriods := map[string]bool{"week": true, "month": true, "quarter": true}
	if !validPeriods[period] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid period. Must be: week, month, or quarter"})
		return
	}

	stats, err := h.dashboardService.GetDashboardStats(tenantID, period)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch dashboard stats"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"stats":  stats,
		"period": period,
	})
}
