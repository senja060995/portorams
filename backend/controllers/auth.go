package controllers

import (
	"net/http"
	"os"
	"strings"
	"time"

	"rams-backend/middleware"
	"rams-backend/models"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// passwordLoginEnabled reports whether the legacy username/password path is
// switched on. It defaults to false: this CMS is wallet-only by design, and
// leaving the endpoint live would reintroduce a weak attack surface.
func passwordLoginEnabled() bool {
	return strings.EqualFold(os.Getenv("ENABLE_PASSWORD_LOGIN"), "true")
}

func (h *Handler) Login(c *gin.Context) {
	if !passwordLoginEnabled() {
		c.JSON(http.StatusForbidden, gin.H{"error": "Login kata sandi dinonaktifkan. Gunakan wallet terdaftar."})
		return
	}

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

	jti := randomNonce()
	session := models.AdminSession{
		Jti:       jti,
		UserID:    user.ID,
		IP:        c.ClientIP(),
		UserAgent: c.Request.UserAgent(),
		ExpiresAt: time.Now().Add(middleware.SessionTTL),
	}
	if err := h.DB.Create(&session).Error; err != nil {
		serverError(c, err)
		return
	}

	token, err := middleware.GenerateToken(user.ID, user.Username, user.Role, user.WalletAddress, jti)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat token autentikasi"})
		return
	}

	middleware.SetSessionCookie(c, token)
	c.JSON(http.StatusOK, models.LoginResponse{Token: token, User: user})
}

// Logout revokes the current session server-side, so the token cannot be used
// again even if it leaks from the tab that signed out.
func (h *Handler) Logout(c *gin.Context) {
	jti := c.GetString("jti")
	if jti != "" {
		_ = middleware.RevokeSession(h.DB, jti)
	}
	middleware.ClearSessionCookie(c)
	c.JSON(http.StatusOK, gin.H{"message": "Berhasil keluar"})
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
