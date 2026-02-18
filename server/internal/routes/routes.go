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

				// Admin only routes
				adminRoutes := tenant.Group("")
				adminRoutes.Use(middleware.RoleMiddleware("admin"))
				{
					adminRoutes.PUT("/tenant", tenantHandler.UpdateTenant)
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
			}
		}
	}
}
