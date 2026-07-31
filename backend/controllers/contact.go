package controllers

import (
	"net/http"
	"strings"
	"time"

	"rams-backend/models"

	"github.com/gin-gonic/gin"
)

func (h *Handler) SubmitContact(c *gin.Context) {
	var req models.ContactRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		badRequest(c, err)
		return
	}

	// Honeypot field: real users never see it, bots fill it in. Respond with a
	// success shape so the bot has no signal that it was rejected.
	if strings.TrimSpace(req.Website) != "" {
		c.JSON(http.StatusCreated, gin.H{"message": "Pesan Anda berhasil terkirim."})
		return
	}

	msg := models.ContactMessage{
		Name:             strings.TrimSpace(req.Name),
		Email:            strings.ToLower(strings.TrimSpace(req.Email)),
		Company:          strings.TrimSpace(req.Company),
		Phone:            strings.TrimSpace(req.Phone),
		SolutionInterest: strings.TrimSpace(req.SolutionInterest),
		Message:          strings.TrimSpace(req.Message),
		Locale:           models.NormalizeLocale(req.Locale),
		Status:           "new",
		CreatedAt:        time.Now(),
	}

	if err := h.DB.Create(&msg).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengirim pesan"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Pesan Anda berhasil terkirim. Tim RAMS akan segera menghubungi Anda.",
	})
}
