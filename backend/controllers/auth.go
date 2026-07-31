package controllers

import (
	"net/http"

	"rams-backend/middleware"
	"rams-backend/models"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func (h *Handler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		badRequest(c, err)
		return
	}

	var user models.User
	err := h.DB.Where("username = ? OR email = ?", req.Username, req.Username).First(&user).Error
	if err != nil {
		// Compare against a dummy hash so a missing user takes roughly the same
		// time as a wrong password, avoiding user enumeration via timing.
		_ = bcrypt.CompareHashAndPassword(
			[]byte("$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"),
			[]byte(req.Password),
		)
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

	c.JSON(http.StatusOK, models.LoginResponse{Token: token, User: user})
}

func (h *Handler) Me(c *gin.Context) {
	userID, _ := c.Get("userID")
	var user models.User
	if err := h.DB.First(&user, userID).Error; err != nil {
		notFound(c, "User tidak ditemukan")
		return
	}
	c.JSON(http.StatusOK, user)
}
