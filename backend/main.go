package main

import (
	"log"
	"os"

	"rams-backend/controllers"
	"rams-backend/db"
	"rams-backend/middleware"
	"rams-backend/models"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func main() {
	// 0. Load .env Configuration
	if err := godotenv.Load(); err != nil {
		log.Println("ℹ️ No .env file found or failed to load, falling back to system environment variables")
	}

	log.Println("🚀 Starting PT. RAMS Backend REST API Server...")

	// 1. Initialize DB Connection (PostgreSQL with SQLite fallback)
	var database *gorm.DB
	var err error

	dbDSN := os.Getenv("DATABASE_URL")
	if dbDSN == "" {
		dbDSN = os.Getenv("POSTGRES_DSN")
	}

	if dbDSN != "" {
		log.Println("🐘 Connecting to PostgreSQL Database...")
		database, err = gorm.Open(postgres.Open(dbDSN), &gorm.Config{})
		if err != nil {
			log.Fatalf("❌ Failed to connect to PostgreSQL database: %v", err)
		}
		log.Println("✅ Connected successfully to PostgreSQL Cluster!")
	} else {
		dbPath := "rams.db"
		log.Println("📦 Connecting to Local SQLite Database:", dbPath)
		database, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
		if err != nil {
			log.Fatalf("❌ Failed to connect to SQLite database: %v", err)
		}
		log.Println("✅ Connected successfully to SQLite Database:", dbPath)
	}

	// 2. Auto Migrate Models
	err = database.AutoMigrate(
		&models.User{},
		&models.Project{},
		&models.Article{},
		&models.Service{},
		&models.Milestone{},
		&models.ContactMessage{},
		&models.SolutionBlueprint{},
		&models.TopologyNode{},
		&models.LiveDevelopmentProject{},
	)
	if err != nil {
		log.Fatalf("❌ AutoMigrate failed: %v", err)
	}

	// 3. Seed Database
	db.SeedDatabase(database)

	// 4. Initialize Gin Router
	r := gin.Default()

	// 5. Configure CORS
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowAllOrigins = true
	corsConfig.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	r.Use(cors.New(corsConfig))

	h := controllers.NewHandler(database)

	// 6. Public Routes
	api := r.Group("/api")
	{
		api.POST("/auth/login", h.Login)

		// Public Portfolio & Content
		api.GET("/projects", h.GetProjects)
		api.GET("/projects/:slug", h.GetProjectBySlug)
		api.GET("/articles", h.GetArticles)
		api.GET("/articles/:slug", h.GetArticleBySlug)
		api.GET("/services", h.GetServices)
		api.GET("/milestones", h.GetMilestones)
		api.POST("/contact", h.SubmitContact)
		api.GET("/simulate-solution", h.SimulateSolution)
		api.GET("/topology", h.GetTopology)
		api.GET("/live-projects", h.GetLiveProjects)
	}

	// 7. Protected CMS Admin Routes
	admin := api.Group("/admin")
	admin.Use(middleware.AuthMiddleware())
	{
		admin.GET("/me", h.Me)
		admin.GET("/stats", h.AdminGetStats)

		// Articles CRUD
		admin.GET("/articles", h.AdminGetArticles)
		admin.POST("/articles", h.AdminCreateArticle)
		admin.PUT("/articles/:id", h.AdminUpdateArticle)
		admin.DELETE("/articles/:id", h.AdminDeleteArticle)

		// Projects CRUD
		admin.POST("/projects", h.AdminCreateProject)
		admin.PUT("/projects/:id", h.AdminUpdateProject)
		admin.DELETE("/projects/:id", h.AdminDeleteProject)

		// Inquiries
		admin.GET("/inquiries", h.AdminGetInquiries)
		admin.PUT("/inquiries/:id/status", h.AdminUpdateInquiryStatus)

		// Topology Nodes CRUD
		admin.POST("/topology", h.AdminCreateTopologyNode)
		admin.PUT("/topology/:id", h.AdminUpdateTopologyNode)
		admin.DELETE("/topology/:id", h.AdminDeleteTopologyNode)

		// Live Development Projects CRUD
		admin.POST("/live-projects", h.AdminCreateLiveProject)
		admin.PUT("/live-projects/:id", h.AdminUpdateLiveProject)
		admin.DELETE("/live-projects/:id", h.AdminDeleteLiveProject)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🌌 RAMS Command Center Backend API running on http://localhost:%s\n", port)
	r.Run(":" + port)
}
