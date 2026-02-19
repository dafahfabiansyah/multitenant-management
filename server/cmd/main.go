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
		&model.Contact{},
		&model.PipelineStage{},
		&model.Deal{},
	); err != nil {
		log.Fatalf("❌ Failed to migrate database: %v", err)
	}
	log.Println("✅ Database migration completed")

	// Initialize repositories
	tenantRepo := repository.NewTenantRepository(db)
	userRepo := repository.NewUserRepository(db)
	tenantUserRepo := repository.NewTenantUserRepository(db)
	auditLogRepo := repository.NewAuditLogRepository(db)
	contactRepo := repository.NewContactRepository(db)
	pipelineStageRepo := repository.NewPipelineStageRepository(db)
	dealRepo := repository.NewDealRepository(db)

	// Initialize services
	authService := service.NewAuthService(userRepo, tenantRepo, tenantUserRepo)
	tenantService := service.NewTenantService(tenantRepo, userRepo, tenantUserRepo, auditLogRepo)
	auditService := service.NewAuditService(auditLogRepo)
	contactService := service.NewContactService(contactRepo, auditLogRepo)
	dashboardService := service.NewDashboardService(contactRepo, auditLogRepo)
	pipelineStageService := service.NewPipelineStageService(pipelineStageRepo)
	dealService := service.NewDealService(dealRepo, pipelineStageRepo, contactRepo)

	// Initialize handlers
	authHandler := handler.NewAuthHandler(authService, tenantUserRepo)
	tenantHandler := handler.NewTenantHandler(tenantService, auditService)
	contactHandler := handler.NewContactHandler(contactService, auditService)
	dashboardHandler := handler.NewDashboardHandler(dashboardService)
	pipelineStageHandler := handler.NewPipelineStageHandler(pipelineStageService, auditService)
	dealHandler := handler.NewDealHandler(dealService, auditService)

	// Setup Gin router
	gin.SetMode(config.AppConfig.Server.GinMode)
	router := gin.New()

	// Global middleware
	router.Use(gin.Recovery())
	router.Use(middleware.Logger())
	router.Use(middleware.CORS())

	// Setup routes
	routes.SetupRoutes(router, authHandler, tenantHandler, contactHandler, dashboardHandler, pipelineStageHandler, dealHandler)

	// Start server
	port := config.AppConfig.Server.Port
	log.Printf("🚀 Server starting on port %s", port)

	if err := router.Run(fmt.Sprintf(":%s", port)); err != nil {
		log.Fatalf("❌ Failed to start server: %v", err)
	}
}
