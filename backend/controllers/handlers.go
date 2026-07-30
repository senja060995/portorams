package controllers

import (
	"net/http"
	"strconv"
	"time"

	"rams-backend/middleware"
	"rams-backend/models"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type Handler struct {
	DB *gorm.DB
}

func NewHandler(db *gorm.DB) *Handler {
	return &Handler{DB: db}
}

// ----------------------------------------------------
// AUTH HANDLERS
// ----------------------------------------------------

func (h *Handler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := h.DB.Where("username = ? OR email = ?", req.Username, req.Username).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Username atau password salah"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Username atau password salah"})
		return
	}

	token, err := middleware.GenerateToken(user.ID, user.Username, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat token autentikasi"})
		return
	}

	c.JSON(http.StatusOK, models.LoginResponse{
		Token: token,
		User:  user,
	})
}

func (h *Handler) Me(c *gin.Context) {
	userID, _ := c.Get("userID")
	var user models.User
	if err := h.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, user)
}

// ----------------------------------------------------
// PUBLIC SHOWCASE API HANDLERS
// ----------------------------------------------------

func (h *Handler) GetProjects(c *gin.Context) {
	var projects []models.Project
	query := h.DB.Order("created_at desc")

	category := c.Query("category")
	if category != "" && category != "All" {
		query = query.Where("category = ?", category)
	}

	scale := c.Query("scale")
	if scale != "" && scale != "All" {
		query = query.Where("scale = ?", scale)
	}

	query.Find(&projects)
	c.JSON(http.StatusOK, projects)
}

func (h *Handler) GetProjectBySlug(c *gin.Context) {
	slug := c.Param("slug")
	var project models.Project
	if err := h.DB.Where("slug = ?", slug).First(&project).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, project)
}

func (h *Handler) GetArticles(c *gin.Context) {
	var articles []models.Article
	query := h.DB.Where("status = ?", "published").Order("published_at desc")

	category := c.Query("category")
	if category != "" && category != "All" {
		query = query.Where("category = ?", category)
	}

	query.Find(&articles)
	c.JSON(http.StatusOK, articles)
}

func (h *Handler) GetArticleBySlug(c *gin.Context) {
	slug := c.Param("slug")
	var article models.Article
	if err := h.DB.Where("slug = ?", slug).First(&article).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Artikel tidak ditemukan"})
		return
	}

	// Increment view count
	h.DB.Model(&article).UpdateColumn("views", gorm.Expr("views + ?", 1))

	c.JSON(http.StatusOK, article)
}

func (h *Handler) GetServices(c *gin.Context) {
	var services []models.Service
	h.DB.Order("`order` asc").Find(&services)
	c.JSON(http.StatusOK, services)
}

func (h *Handler) GetMilestones(c *gin.Context) {
	var milestones []models.Milestone
	h.DB.Order("`order` asc").Find(&milestones)
	c.JSON(http.StatusOK, milestones)
}

func (h *Handler) SubmitContact(c *gin.Context) {
	var msg models.ContactMessage
	if err := c.ShouldBindJSON(&msg); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	msg.Status = "new"
	msg.CreatedAt = time.Now()

	if err := h.DB.Create(&msg).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengirim pesan"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Pesan Anda berhasil terkirim. Tim RAMS akan segera menghubungi Anda.",
		"data":    msg,
	})
}

func (h *Handler) SimulateSolution(c *gin.Context) {
	industry := c.Query("industry")
	scale := c.Query("scale")

	var blueprint models.SolutionBlueprint
	h.DB.Where("industry_key = ? AND scale_key = ?", industry, scale).First(&blueprint)

	if blueprint.ID == 0 || blueprint.IndustryKey != industry {
		blueprint = getDynamicBlueprint(industry, scale)
	}

	c.JSON(http.StatusOK, blueprint)
}

func getDynamicBlueprint(ind string, sc string) models.SolutionBlueprint {
	switch ind {
	case "retail":
		if sc == "enterprise" {
			return models.SolutionBlueprint{
				IndustryKey:     "retail",
				ScaleKey:        "enterprise",
				Title:           "Enterprise High-Throughput Retail POS & Automated Supply Chain",
				RecommendedArch: "Distributed SQLite Nodes + Nginx Load Balancer + Event-Driven Kafka + Cloud PostgreSQL Cluster",
				TechStack:       "React Native, SQLite Engine, Golang Microservices, Apache Kafka, PostgreSQL Active-Standby",
				Features:        "Multi-store warehouse sync, automated purchase orders, central pricing dispatch, real-time sales telemetry",
				EstimatedImpact: "Skalabilitas 500+ outlet retail bersamaan, rekonsiliasi data inventoris nasional dalam 3 detik",
			}
		}
		return models.SolutionBlueprint{
			IndustryKey:     "retail",
			ScaleKey:        "medium",
			Title:           "Offline-First POS & Retail Multi-Outlet Network",
			RecommendedArch: "SQLite Local Transaction Engine + Sync Gateway Worker + Central Cloud PostgreSQL",
			TechStack:       "React Native, Expo, SQLite Local Buffer, Golang REST API, Redis, Docker",
			Features:        "Offline transaction buffer, auto-sync backoff, multi-outlet stock tracking, Bluetooth receipt printing",
			EstimatedImpact: "100% uptime kasir tanpa mati transaksi saat internet terputus, akurasi stok otomatis 99%",
		}

	case "enterprise":
		if sc == "enterprise" {
			return models.SolutionBlueprint{
				IndustryKey:     "enterprise",
				ScaleKey:        "enterprise",
				Title:           "Multi-Tenant Enterprise ERP Superapp & Financial Audit Engine",
				RecommendedArch: "Microservices API Gateway + Isolated Tenant DBs + Active-Active Database Cluster + Distributed Redis Cache",
				TechStack:       "Next.js 14, Golang Microservices, PostgreSQL Active-Active Cluster, Apache Kafka, Redis, Docker, Kubernetes",
				Features:        "Multi-company consolidation, real-time HPP & WIP tracking, automated tax & e-Faktur compliance, multi-currency ledger",
				EstimatedImpact: "Audit finansial real-time 100% terverifikasi, penghematan biaya operasional manufaktur hingga 35%",
			}
		}
		return models.SolutionBlueprint{
			IndustryKey:     "enterprise",
			ScaleKey:        "medium",
			Title:           "Modular ERP Printing & Manufacturing Automation",
			RecommendedArch: "Modular Monolithic Architecture + Isolated Tenant Schemas + Redis In-Memory Cache",
			TechStack:       "Next.js 14, Golang Clean Architecture, PostgreSQL, Redis, Nginx",
			Features:        "Kalkulasi otomatis HPP percetakan, Work Order live kanban, stok bahan baku otomatis, laporan keuangan real-time",
			EstimatedImpact: "Efisiensi kalkulasi HPP percetakan naik 85%, waktu penyusunan laporan keuangan berkurang dari 5 hari ke 10 detik",
		}

	case "ticketing":
		if sc == "enterprise" {
			return models.SolutionBlueprint{
				IndustryKey:     "ticketing",
				ScaleKey:        "enterprise",
				Title:           "High-Throughput Stadium & National Event Ticketing Infrastructure",
				RecommendedArch: "Distributed Token Queue + Multi-Region Redis Cluster + Real-time Gate Analytics",
				TechStack:       "Next.js, Golang High-Throughput Microservices, Redis Cluster, WebSockets, PostgreSQL Active-Standby",
				Features:        "Throughput 150.000 TPS, multi-gate sync, seat map locking, auto-refund queue",
				EstimatedImpact: "Kapasitas 150.000 TPS tanpa kelambatan, 100% validasi tiket stadion nasional",
			}
		}
		return models.SolutionBlueprint{
			IndustryKey:     "ticketing",
			ScaleKey:        "medium",
			Title:           "High-Throughput Event Waiting Room & Gate Scanner Blueprint",
			RecommendedArch: "Token Waiting Room Queue Buffer + Redis In-Memory Worker + Offline QR Gate Validator",
			TechStack:       "Next.js, Golang Engine, Redis Queue, WebSockets, PostgreSQL Active-Standby",
			Features:        "Rate limiting 150.000 TPS, dynamic encrypted QR validation, anti-duplikasi tiket, live gate counter",
			EstimatedImpact: "Zero crash saat war ticket masal, validasi gate masuk <0.5 detik/pengunjung",
		}

	case "logistics":
		if sc == "enterprise" {
			return models.SolutionBlueprint{
				IndustryKey:     "logistics",
				ScaleKey:        "enterprise",
				Title:           "Enterprise Logistics Network & Automated Warehouse WMS",
				RecommendedArch: "Distributed IoT Telematics + Kafka Event Bus + WMS Warehouse Engine",
				TechStack:       "Golang Microservices, Apache Kafka, PostGIS, React Native, Kubernetes",
				Features:        "Cross-docking automation, barcode scanner dispatch, route optimization AI, real-time SLA monitor",
				EstimatedImpact: "Penghematan biaya bahan bakar armada 30%, akurasi inventoris gudang 99.8%",
			}
		}
		return models.SolutionBlueprint{
			IndustryKey:     "logistics",
			ScaleKey:        "medium",
			Title:           "Smart Fleet Tracking & Automated Dispatch Blueprint",
			RecommendedArch: "IoT Telematics Ingestion Pipeline + Geospatial Indexing + Driver Mobile App",
			TechStack:       "Golang IoT Ingestion Engine, PostGIS / PostgreSQL, Flutter / React Native, Redis",
			Features:        "Live GPS fleet tracking, geofencing alert, fuel consumption analytics, digital Proof of Delivery",
			EstimatedImpact: "Efisiensi rute armada 25%, akurasi pengiriman tepat waktu naik hingga 98%",
		}

	default:
		if sc == "enterprise" {
			return models.SolutionBlueprint{
				IndustryKey:     "custom",
				ScaleKey:        "enterprise",
				Title:           "Enterprise Microservices Ecosystem & High-Security Gateway",
				RecommendedArch: "Kubernetes Microservices Mesh + Distributed DB Sharding + Zero-Trust Auth",
				TechStack:       "Next.js, Golang, Python, PostgreSQL Sharded, Kafka, Redis, Kubernetes",
				Features:        "Zero-trust OAuth2/JWT security, automated failover, load balancing, audit log compliance",
				EstimatedImpact: "Zero single point of failure, kesiapan skalabilitas hingga jutaan transaksi harian",
			}
		}
		return models.SolutionBlueprint{
			IndustryKey:     "custom",
			ScaleKey:        "medium",
			Title:           "Custom High Availability Software Architecture",
			RecommendedArch: "Clean Architecture Modular System + REST/GraphQL Gateway + Redis Cache",
			TechStack:       "Next.js, Golang, Python, PostgreSQL, Redis",
			Features:        "Clean Architecture codebase, role-based access control, automated CI/CD pipeline, real-time telemetry",
			EstimatedImpact: "Skalabilitas tinggi dengan SLA Uptime 99.99% dan maintenance terukur",
		}
	}
}

func (h *Handler) GetTopology(c *gin.Context) {
	var nodes []models.TopologyNode
	h.DB.Order("id asc").Find(&nodes)
	c.JSON(http.StatusOK, nodes)
}

func (h *Handler) GetLiveProjects(c *gin.Context) {
	var projects []models.LiveDevelopmentProject
	h.DB.Order("id asc").Find(&projects)
	c.JSON(http.StatusOK, projects)
}

// ----------------------------------------------------
// CMS ADMIN HANDLERS (PROTECTED)
// ----------------------------------------------------

func (h *Handler) AdminGetStats(c *gin.Context) {
	var totalProjects int64
	var totalArticles int64
	var totalInquiries int64
	var unreadInquiries int64

	h.DB.Model(&models.Project{}).Count(&totalProjects)
	h.DB.Model(&models.Article{}).Count(&totalArticles)
	h.DB.Model(&models.ContactMessage{}).Count(&totalInquiries)
	h.DB.Model(&models.ContactMessage{}).Where("status = ?", "new").Count(&unreadInquiries)

	c.JSON(http.StatusOK, gin.H{
		"total_projects":   totalProjects,
		"total_articles":   totalArticles,
		"total_inquiries":  totalInquiries,
		"unread_inquiries": unreadInquiries,
	})
}

// Admin Article CRUD
func (h *Handler) AdminGetArticles(c *gin.Context) {
	var articles []models.Article
	h.DB.Order("created_at desc").Find(&articles)
	c.JSON(http.StatusOK, articles)
}

func (h *Handler) AdminCreateArticle(c *gin.Context) {
	var article models.Article
	if err := c.ShouldBindJSON(&article); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	article.CreatedAt = time.Now()
	article.UpdatedAt = time.Now()
	if article.PublishedAt.IsZero() && article.Status == "published" {
		article.PublishedAt = time.Now()
	}

	if err := h.DB.Create(&article).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, article)
}

func (h *Handler) AdminUpdateArticle(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	var article models.Article
	if err := h.DB.First(&article, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Artikel tidak ditemukan"})
		return
	}

	if err := c.ShouldBindJSON(&article); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	article.UpdatedAt = time.Now()

	h.DB.Save(&article)
	c.JSON(http.StatusOK, article)
}

func (h *Handler) AdminDeleteArticle(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	if err := h.DB.Delete(&models.Article{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Artikel berhasil dihapus"})
}

// Admin Project CRUD
func (h *Handler) AdminCreateProject(c *gin.Context) {
	var project models.Project
	if err := c.ShouldBindJSON(&project); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	project.CreatedAt = time.Now()
	project.UpdatedAt = time.Now()

	if err := h.DB.Create(&project).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, project)
}

func (h *Handler) AdminUpdateProject(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	var project models.Project
	if err := h.DB.First(&project, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project tidak ditemukan"})
		return
	}

	if err := c.ShouldBindJSON(&project); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	project.UpdatedAt = time.Now()

	h.DB.Save(&project)
	c.JSON(http.StatusOK, project)
}

func (h *Handler) AdminDeleteProject(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	if err := h.DB.Delete(&models.Project{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Project berhasil dihapus"})
}

// Admin Inquiries
func (h *Handler) AdminGetInquiries(c *gin.Context) {
	var messages []models.ContactMessage
	h.DB.Order("created_at desc").Find(&messages)
	c.JSON(http.StatusOK, messages)
}

func (h *Handler) AdminUpdateInquiryStatus(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	var body struct {
		Status string `json:"status"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	h.DB.Model(&models.ContactMessage{}).Where("id = ?", id).Update("status", body.Status)
	c.JSON(http.StatusOK, gin.H{"message": "Status inquiry berhasil diperbarui"})
}

// Admin Topology Node CRUD
func (h *Handler) AdminCreateTopologyNode(c *gin.Context) {
	var node models.TopologyNode
	if err := c.ShouldBindJSON(&node); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.DB.Create(&node).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, node)
}

func (h *Handler) AdminUpdateTopologyNode(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	var node models.TopologyNode
	if err := h.DB.First(&node, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Node tidak ditemukan"})
		return
	}

	if err := c.ShouldBindJSON(&node); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	h.DB.Save(&node)
	c.JSON(http.StatusOK, node)
}

func (h *Handler) AdminDeleteTopologyNode(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	if err := h.DB.Delete(&models.TopologyNode{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Node topology berhasil dihapus"})
}

// Admin Live Development Projects CRUD
func (h *Handler) AdminCreateLiveProject(c *gin.Context) {
	var proj models.LiveDevelopmentProject
	if err := c.ShouldBindJSON(&proj); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.DB.Create(&proj).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, proj)
}

func (h *Handler) AdminUpdateLiveProject(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	var proj models.LiveDevelopmentProject
	if err := h.DB.First(&proj, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Proyek tidak ditemukan"})
		return
	}

	if err := c.ShouldBindJSON(&proj); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	h.DB.Save(&proj)
	c.JSON(http.StatusOK, proj)
}

func (h *Handler) AdminDeleteLiveProject(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	if err := h.DB.Delete(&models.LiveDevelopmentProject{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Live project berhasil dihapus"})
}
