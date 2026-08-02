package controllers

import (
	"net/http"
	"strconv"

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

	// AI provider (OpenAI-compatible, e.g. Groq). Leave the API key empty to
	// fall back to the built-in keyword bot for the customer chat.
	AIBaseURL string
	AIAPIKey  string
	AIModel   string
}

func NewHandler(db *gorm.DB, uploadDir, publicURL, siweDomain, siweURI string, chainID int64, aiBaseURL, aiAPIKey, aiModel string) *Handler {
	return &Handler{
		DB:         db,
		UploadDir:  uploadDir,
		PublicURL:  publicURL,
		SiweDomain: siweDomain,
		SiweURI:    siweURI,
		ChainID:    chainID,
		Lockout:    middleware.NewLockout(),
		AIBaseURL:  aiBaseURL,
		AIAPIKey:   aiAPIKey,
		AIModel:    aiModel,
	}
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
