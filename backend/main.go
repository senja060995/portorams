package main

import (
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

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
	if err := godotenv.Load(); err != nil {
		log.Println("ℹ️  No .env file found, falling back to system environment variables")
	}

	log.Println("🚀 Starting PT RAMS content API...")

	if err := middleware.InitJWTSecret(); err != nil {
		log.Fatalf("❌ %v", err)
	}

	database := connectDatabase()

	if err := database.AutoMigrate(
		&models.User{},
		&models.Partner{},
		&models.ValueProp{},
		&models.Solution{},
		&models.SolutionFeature{},
		&models.SolutionUseCase{},
		&models.Product{},
		&models.ProductValue{},
		&models.ProductFeature{},
		&models.ArticleCategory{},
		&models.Article{},
		&models.ApproachStep{},
		&models.PageSection{},
		&models.SiteSetting{},
		&models.LegalPage{},
		&models.ContactMessage{},
		&models.MediaAsset{},
	); err != nil {
		log.Fatalf("❌ AutoMigrate failed: %v", err)
	}

	db.SeedDatabase(database)

	uploadDir := os.Getenv("UPLOAD_DIR")
	if uploadDir == "" {
		uploadDir = "uploads"
	}
	absUploadDir, err := filepath.Abs(uploadDir)
	if err != nil {
		log.Fatalf("❌ Invalid UPLOAD_DIR: %v", err)
	}
	if err := os.MkdirAll(absUploadDir, 0o755); err != nil {
		log.Fatalf("❌ Cannot create upload directory: %v", err)
	}

	publicURL := strings.TrimRight(os.Getenv("PUBLIC_API_URL"), "/")
	if publicURL == "" {
		publicURL = "http://localhost:8080"
	}

	if os.Getenv("GIN_MODE") == "" && os.Getenv("APP_ENV") == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()
	r.Use(securityHeaders())
	r.Use(cors.New(corsConfig()))
	r.MaxMultipartMemory = 8 << 20

	// Uploaded media is served read-only from disk.
	r.Static("/uploads", absUploadDir)

	h := controllers.NewHandler(database, absUploadDir, publicURL)

	r.GET("/healthz", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	api := r.Group("/api")
	{
		api.POST("/auth/login", middleware.RateLimit(10, time.Minute), h.Login)

		api.GET("/settings", h.GetSettings)
		api.GET("/sections", h.GetSections)
		api.GET("/partners", h.GetPartners)
		api.GET("/value-props", h.GetValueProps)
		api.GET("/approach-steps", h.GetApproachSteps)

		api.GET("/solutions", h.GetSolutions)
		api.GET("/solutions/:slug", h.GetSolutionBySlug)

		api.GET("/products", h.GetProducts)
		api.GET("/products/:slug", h.GetProductBySlug)

		api.GET("/article-categories", h.GetArticleCategories)
		api.GET("/articles", h.GetArticles)
		api.GET("/articles/:slug", h.GetArticleBySlug)

		api.GET("/legal/:slug", h.GetLegalPage)

		api.POST("/contact", middleware.RateLimit(5, 10*time.Minute), h.SubmitContact)
	}

	admin := api.Group("/admin")
	admin.Use(middleware.AuthMiddleware(), middleware.RequireRole("admin", "editor"))
	{
		admin.GET("/me", h.Me)
		admin.GET("/stats", h.AdminGetStats)

		admin.GET("/solutions", h.AdminGetSolutions)
		admin.POST("/solutions", h.AdminCreateSolution)
		admin.PUT("/solutions/:id", h.AdminUpdateSolution)
		admin.DELETE("/solutions/:id", h.AdminDeleteSolution)

		admin.GET("/products", h.AdminGetProducts)
		admin.POST("/products", h.AdminCreateProduct)
		admin.PUT("/products/:id", h.AdminUpdateProduct)
		admin.DELETE("/products/:id", h.AdminDeleteProduct)

		admin.GET("/articles", h.AdminGetArticles)
		admin.POST("/articles", h.AdminCreateArticle)
		admin.PUT("/articles/:id", h.AdminUpdateArticle)
		admin.DELETE("/articles/:id", h.AdminDeleteArticle)

		admin.GET("/article-categories", h.AdminGetCategories)
		admin.POST("/article-categories", h.AdminUpsertCategory)

		admin.GET("/partners", h.AdminGetPartners)
		admin.POST("/partners", h.AdminCreatePartner)
		admin.PUT("/partners/:id", h.AdminUpdatePartner)
		admin.DELETE("/partners/:id", h.AdminDeletePartner)

		admin.GET("/value-props", h.AdminGetValueProps)
		admin.POST("/value-props", h.AdminUpsertValueProp)
		admin.DELETE("/value-props/:id", h.AdminDeleteValueProp)

		admin.GET("/approach-steps", h.AdminGetApproachSteps)
		admin.POST("/approach-steps", h.AdminUpsertApproachStep)
		admin.DELETE("/approach-steps/:id", h.AdminDeleteApproachStep)

		admin.GET("/sections", h.AdminGetSections)
		admin.POST("/sections", h.AdminUpsertSection)

		admin.GET("/settings", h.AdminGetSettings)
		admin.POST("/settings", h.AdminUpsertSettings)

		admin.GET("/legal", h.AdminGetLegalPages)
		admin.POST("/legal", h.AdminUpsertLegalPage)

		admin.GET("/inquiries", h.AdminGetInquiries)
		admin.PUT("/inquiries/:id/status", h.AdminUpdateInquiryStatus)
		admin.DELETE("/inquiries/:id", h.AdminDeleteInquiry)

		admin.POST("/upload", h.UploadMedia)
		admin.GET("/media", h.AdminListMedia)
		admin.DELETE("/media/:id", h.AdminDeleteMedia)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🌐 RAMS API listening on http://localhost:%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("❌ Server stopped: %v", err)
	}
}

func connectDatabase() *gorm.DB {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = os.Getenv("POSTGRES_DSN")
	}

	if dsn != "" {
		log.Println("🐘 Connecting to PostgreSQL...")
		database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
		if err != nil {
			log.Fatalf("❌ Failed to connect to PostgreSQL: %v", err)
		}
		log.Println("✅ PostgreSQL connected")
		return database
	}

	path := envOr("SQLITE_PATH", "rams.db")
	log.Println("📦 Connecting to local SQLite:", path)
	database, err := gorm.Open(sqlite.Open(path), &gorm.Config{})
	if err != nil {
		log.Fatalf("❌ Failed to connect to SQLite: %v", err)
	}
	log.Println("✅ SQLite connected:", path)
	return database
}

// corsConfig builds an origin whitelist from ALLOWED_ORIGINS. Wildcard origins
// are deliberately not supported so a deployed API never accepts credentialed
// requests from arbitrary sites.
func corsConfig() cors.Config {
	cfg := cors.DefaultConfig()
	cfg.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	cfg.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	cfg.MaxAge = 12 * time.Hour

	raw := os.Getenv("ALLOWED_ORIGINS")
	if raw == "" {
		raw = "http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,https://rams.biz.id"
	}

	origins := []string{}
	for _, o := range strings.Split(raw, ",") {
		if trimmed := strings.TrimSpace(o); trimmed != "" && trimmed != "*" {
			origins = append(origins, trimmed)
		}
	}
	if len(origins) == 0 {
		origins = []string{"http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "https://rams.biz.id"}
	}
	cfg.AllowOrigins = origins
	log.Printf("🔐 CORS allowed origins: %s", strings.Join(origins, ", "))
	return cfg
}

func securityHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "DENY")
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Next()
	}
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
