package controllers

import (
	"net/http"
	"os"
	"strconv"
	"strings"

	"rams-backend/middleware"
	"rams-backend/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Handler struct {
	DB         *gorm.DB
	UploadDir  string
	PublicURL  string
	SiweDomain string
	SiweURI    string
	ChainID    int64
	Lockout    *middleware.Lockout

	// AllowedOrigins is the same whitelist used by CORS; it also gates the
	// wallet challenge endpoint so a signed-in UI on an unknown origin cannot
	// trigger challenges.
	AllowedOrigins []string

	// AI provider (OpenAI-compatible, e.g. Groq). Leave the API key empty to
	// fall back to the built-in keyword bot for the customer chat.
	AIBaseURL string
	AIAPIKey  string
	AIModel   string
}

func NewHandler(db *gorm.DB, uploadDir, publicURL, siweDomain, siweURI string, chainID int64, aiBaseURL, aiAPIKey, aiModel string) *Handler {
	return &Handler{
		DB:             db,
		UploadDir:      uploadDir,
		PublicURL:      publicURL,
		SiweDomain:     siweDomain,
		SiweURI:        siweURI,
		ChainID:        chainID,
		Lockout:        middleware.NewLockout(),
		AllowedOrigins: allowedOriginsFromEnv(),
		AIBaseURL:      aiBaseURL,
		AIAPIKey:       aiAPIKey,
		AIModel:        aiModel,
	}
}

// allowedOriginsFromEnv parses ALLOWED_ORIGINS with the same defaults and
// sanitisation used by the CORS middleware.
func allowedOriginsFromEnv() []string {
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
	return origins
}

// requestIsFromOurSite verifies the Host header matches the configured SIWE
// domain (optionally www-prefixed) and, when an Origin header is present, that
// it is in the allowlist. This stops the challenge endpoint from being driven
// from a different hostname than the one users trust with their signature.
func (h *Handler) requestIsFromOurSite(c *gin.Context) bool {
	host := strings.ToLower(strings.TrimSpace(c.Request.Host))
	if host == "" {
		// Backend tests and health checks may omit it; the signature check is
		// what actually protects the flow.
		return true
	}
	host = strings.TrimPrefix(host, "www.")
	expected := strings.ToLower(h.SiweDomain)
	if !strings.HasPrefix(expected, "www.") {
		expected = strings.TrimPrefix(expected, "www.")
	}
	if host != expected {
		return false
	}

	origin := c.GetHeader("Origin")
	if origin == "" {
		return true
	}
	for _, o := range h.AllowedOrigins {
		if strings.EqualFold(strings.TrimRight(o, "/"), strings.TrimRight(origin, "/")) {
			return true
		}
	}
	return false
}

// locale reads the requested content locale from the query string.
func locale(c *gin.Context) string {
	return models.NormalizeLocale(c.Query("locale"))
}

// paramID parses a positive integer route parameter.
func paramID(c *gin.Context) (uint, bool) {
	raw := c.Param("id")
	id, err := strconv.ParseUint(raw, 10, 32)
	if err != nil || id == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return 0, false
	}
	return uint(id), true
}

func badRequest(c *gin.Context, err error) {
	c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
}

func serverError(c *gin.Context, err error) {
	c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
}

func notFound(c *gin.Context, msg string) {
	c.JSON(http.StatusNotFound, gin.H{"error": msg})
}
