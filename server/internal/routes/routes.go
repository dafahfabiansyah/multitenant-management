package routes

import (
	"gin-quickstart/internal/handler"
	"gin-quickstart/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(
	router *gin.Engine,
	authHandler *handler.AuthHandler,
	tenantHandler *handler.TenantHandler,
	contactHandler *handler.ContactHandler,
	dashboardHandler *handler.DashboardHandler,
	pipelineStageHandler *handler.PipelineStageHandler,
	dealHandler *handler.DealHandler,
) {
	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// API
	api := router.Group("/api")
	{
		// Public routes (no authentication required)
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
		}

		// Protected routes (authentication required)
		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware())
		{
			// User's tenant management
			protected.GET("/tenants/my", authHandler.GetMyTenants)
			protected.POST("/tenants/switch/:tenant_id", authHandler.SwitchTenant)

			// Tenant-specific routes (requires tenant context)
			tenant := protected.Group("")
			tenant.Use(middleware.TenantMiddleware())
			{
				// Current tenant info
				tenant.GET("/tenant", tenantHandler.GetTenant)

				// Dashboard statistics (all authenticated users)
				tenant.GET("/dashboard/stats", dashboardHandler.GetStats)

				// Admin only routes
				adminRoutes := tenant.Group("")
				adminRoutes.Use(middleware.RoleMiddleware("admin"))
				{
					adminRoutes.PUT("/tenant", tenantHandler.UpdateTenant)
					adminRoutes.POST("/tenant/users", tenantHandler.AddUser)
					adminRoutes.DELETE("/tenant/users/:user_id", tenantHandler.RemoveUser)
					adminRoutes.PUT("/tenant/users/:user_id/role", tenantHandler.UpdateUserRole)
					adminRoutes.GET("/tenant/audit-logs", tenantHandler.GetAuditLogs)
				}

				// Manager and Admin routes (can view users)
				managerRoutes := tenant.Group("")
				managerRoutes.Use(middleware.RoleMiddleware("admin", "manager"))
				{
					managerRoutes.GET("/tenant/users", tenantHandler.GetTenantUsers)
				}

				// Contact routes (all authenticated tenant users)
				contacts := tenant.Group("/contacts")
				{
					contacts.POST("", contactHandler.CreateContact)
					contacts.GET("", contactHandler.GetContacts)
					contacts.GET("/search", contactHandler.SearchContacts)
					contacts.GET("/:id", contactHandler.GetContact)
					contacts.PATCH("/:id", contactHandler.UpdateContact)
					contacts.DELETE("/:id", contactHandler.DeleteContact)
				}

				// Pipeline routes (all authenticated tenant users)
				pipeline := tenant.Group("/pipeline")
				{
					// Stage management
					pipeline.GET("/stages", pipelineStageHandler.GetStages)
					pipeline.GET("/stages/:id", pipelineStageHandler.GetStage)
					pipeline.POST("/stages", pipelineStageHandler.CreateStage)
					pipeline.PATCH("/stages/:id", pipelineStageHandler.UpdateStage)
					pipeline.DELETE("/stages/:id", pipelineStageHandler.DeleteStage)
					pipeline.PUT("/stages/reorder", pipelineStageHandler.ReorderStages)
				}

				// Deal routes (all authenticated tenant users)
				deals := tenant.Group("/deals")
				{
					deals.POST("", dealHandler.CreateDeal)
					deals.GET("", dealHandler.GetDeals)
					deals.GET("/pipeline-value", dealHandler.GetPipelineValue)
					deals.GET("/:id", dealHandler.GetDeal)
					deals.PATCH("/:id", dealHandler.UpdateDeal)
					deals.DELETE("/:id", dealHandler.DeleteDeal)
					deals.PUT("/:id/move", dealHandler.MoveToStage)
					deals.PUT("/:id/status", dealHandler.UpdateStatus)
				}
			}
		}
	}
}
