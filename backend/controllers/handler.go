package controllers

import (
	"net/http"
	"strconv"

	"rams-backend/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Handler struct {
	DB        *gorm.DB
	UploadDir string
	PublicURL string
}

func NewHandler(db *gorm.DB, uploadDir, publicURL string) *Handler {
	return &Handler{DB: db, UploadDir: uploadDir, PublicURL: publicURL}
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
