package models

import (
	"time"
)

type User struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Username  string    `gorm:"uniqueIndex;not null" json:"username"`
	Email     string    `gorm:"uniqueIndex;not null" json:"email"`
	Password  string    `gorm:"not null" json:"-"`
	Role      string    `gorm:"default:'admin'" json:"role"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Project struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	Title         string    `gorm:"not null" json:"title"`
	Slug          string    `gorm:"uniqueIndex;not null" json:"slug"`
	Subtitle      string    `json:"subtitle"`
	Category      string    `json:"category"`     // e.g. ERP, POS, CRM, Custom Software, IoT/Automation
	Scale         string    `json:"scale"`        // Kecil, Menengah, Besar
	ScaleBadge    string    `json:"scale_badge"`  // Telemetry badge info
	Client        string    `json:"client"`       // e.g. PT Sidomulyo Advertising & Network
	Year          string    `json:"year"`         // e.g. 2024
	Problem       string    `json:"problem"`      // Problem statement
	Solution      string    `json:"solution"`     // Solution statement
	Impact        string    `json:"impact"`       // Real impact result
	TechStack     string    `json:"tech_stack"`   // Comma separated e.g. Next.js, Golang, PostgreSQL, Redis
	Architecture  string    `json:"architecture"` // JSON or string of architecture components
	ImageURL      string    `json:"image_url"`
	Featured      bool      `gorm:"default:false" json:"featured"`
	Throughput    string    `json:"throughput"`    // Telemetry metric e.g. 50k req/min
	Microservices int       `json:"microservices"` // Telemetry metric e.g. 8 services
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type Article struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Title       string    `gorm:"not null" json:"title"`
	Slug        string    `gorm:"uniqueIndex;not null" json:"slug"`
	Excerpt     string    `json:"excerpt"`
	Content     string    `gorm:"type:text" json:"content"`
	Category    string    `json:"category"`
	Tags        string    `json:"tags"` // Comma separated
	Author      string    `json:"author"`
	Status      string    `gorm:"default:'published'" json:"status"` // published, draft
	ImageURL    string    `json:"image_url"`
	Views       int       `gorm:"default:0" json:"views"`
	ReadTime    string    `json:"read_time"`
	PublishedAt time.Time `json:"published_at"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Service struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	Title       string `gorm:"not null" json:"title"`
	Subtitle    string `json:"subtitle"`
	Description string `json:"description"`
	Icon        string `json:"icon"` // Lucide icon name
	Category    string `json:"category"`
	Features    string `json:"features"`   // Pipe separated list
	TechStack   string `json:"tech_stack"` // Comma separated
	Order       int    `gorm:"default:0" json:"order"`
}

type Milestone struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	Year        string `json:"year"`
	Title       string `json:"title"`
	Subtitle    string `json:"subtitle"`
	Description string `json:"description"`
	Icon        string `json:"icon"`
	ScaleBadge  string `json:"scale_badge"`
	Order       int    `gorm:"default:0" json:"order"`
}

type ContactMessage struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"not null" json:"name"`
	Email     string    `gorm:"not null" json:"email"`
	Company   string    `json:"company"`
	Phone     string    `json:"phone"`
	Subject   string    `json:"subject"`
	Message   string    `gorm:"not null" json:"message"`
	Status    string    `gorm:"default:'new'" json:"status"` // new, read, archived
	CreatedAt time.Time `json:"created_at"`
}

type SolutionBlueprint struct {
	ID              uint   `gorm:"primaryKey" json:"id"`
	IndustryKey     string `json:"industry_key"` // retail, enterprise, logistics, ticketing, custom
	ScaleKey        string `json:"scale_key"`    // small, medium, enterprise
	Title           string `json:"title"`
	RecommendedArch string `json:"recommended_arch"`
	TechStack       string `json:"tech_stack"`
	Features        string `json:"features"`
	EstimatedImpact string `json:"estimated_impact"`
}

type TopologyNode struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	ProjectName string `json:"project_name"` // e.g. B2B Marketplace Engine, RAMS ERP
	NodeName    string `json:"node_name"`    // e.g. ERP Engine, POS System, Marketplace, HR, Accounting
	NodeType    string `json:"node_type"`    // center, provider, worker, database
	Status      string `json:"status"`       // LIVE, IN_PROGRESS
	ConnectedTo uint   `json:"connected_to"` // Parent Node ID
	Badge       string `json:"badge"`        // Status text badge
	Icon        string `json:"icon"`         // Icon identifier
}

type LiveDevelopmentProject struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Title       string    `gorm:"not null" json:"title"`
	Slug        string    `gorm:"uniqueIndex;not null" json:"slug"`
	Category    string    `json:"category"`
	Status      string    `json:"status"`      // e.g. "Active Development", "Staging", "Production Live"
	Progress    int       `json:"progress"`    // e.g. 85 (%)
	TargetDate  string    `json:"target_date"` // e.g. Q3 2026
	Client      string    `json:"client"`
	Description string    `gorm:"type:text" json:"description"`
	NodesJSON   string    `gorm:"type:text" json:"nodes_json"` // JSON payload of project nodes & topology with LIVE / IN_PROGRESS status
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}
