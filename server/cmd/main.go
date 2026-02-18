package main

import (
	"fmt"
	"gin-quickstart/config"
	"gin-quickstart/internal/handler"
	"gin-quickstart/internal/middleware"
	"gin-quickstart/internal/model"
	"gin-quickstart/internal/repository"
	"gin-quickstart/internal/routes"
	"gin-quickstart/internal/service"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️  No .env file found, using system environment variables")
	}

	// Load configuration
	config.LoadConfig()

	// Initialize database connection
	db, err := config.InitDB()
	if err != nil {
		log.Fatalf("❌ Failed to connect to database: %v", err)
	}
	defer config.CloseDB()

	// Auto migrate database schema
	if err := db.AutoMigrate(
		&model.Tenant{},
		&model.User{},
		&model.TenantUser{},
		&model.TenantSetting{},
		&model.AuditLog{},
	); err != nil {
		log.Fatalf("❌ Failed to migrate database: %v", err)
	}
	log.Println("✅ Database migration completed")

	// Initialize repositories
	tenantRepo := repository.NewTenantRepository(db)
	userRepo := repository.NewUserRepository(db)
	tenantUserRepo := repository.NewTenantUserRepository(db)
	auditLogRepo := repository.NewAuditLogRepository(db)

	// Initialize services
	authService := service.NewAuthService(userRepo, tenantRepo, tenantUserRepo)
	tenantService := service.NewTenantService(tenantRepo, tenantUserRepo, auditLogRepo)
	auditService := service.NewAuditService(auditLogRepo)

	// Initialize handlers
	authHandler := handler.NewAuthHandler(authService, tenantUserRepo)
	tenantHandler := handler.NewTenantHandler(tenantService, auditService)

	// Setup Gin router
	gin.SetMode(config.AppConfig.Server.GinMode)
	router := gin.New()

	// Global middleware
	router.Use(gin.Recovery())
	router.Use(middleware.Logger())
	router.Use(middleware.CORS())

	// Setup routes
	routes.SetupRoutes(router, authHandler, tenantHandler)

	// Start server
	port := config.AppConfig.Server.Port
	log.Printf("🚀 Server starting on port %s", port)
	log.Printf("📊 Multi-tenant Management System is ready!")
	log.Printf("🔒 Security: Connection pooling, JWT auth, tenant isolation enabled")

	if err := router.Run(fmt.Sprintf(":%s", port)); err != nil {
		log.Fatalf("❌ Failed to start server: %v", err)
	}
}
