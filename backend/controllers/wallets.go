package controllers

import (
	"net/http"
	"strconv"
	"strings"

	"rams-backend/middleware"
	"rams-backend/models"

	"github.com/gin-gonic/gin"
)

// WalletAccessRequest is the payload for creating/updating an allowlist entry.
type WalletAccessRequest struct {
	Address string `json:"address" binding:"required"`
	Label   string `json:"label"`
	Role    string `json:"role"`
	Active  *bool  `json:"active"`
}

func (h *Handler) AdminGetWallets(c *gin.Context) {
	var wallets []models.AllowedWallet
	if err := h.DB.Order("created_at asc").Find(&wallets).Error; err != nil {
		serverError(c, err)
		return
	}
	c.JSON(http.StatusOK, wallets)
}

// AdminCreateWallet adds an address to the allowlist. Only the address itself
// is security-relevant; every other field is metadata.
func (h *Handler) AdminCreateWallet(c *gin.Context) {
	var req WalletAccessRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		badRequest(c, err)
		return
	}

	address, err := NormalizeAddress(req.Address)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Alamat wallet tidak valid"})
		return
	}

	var existing models.AllowedWallet
	if err := h.DB.Where("address = ?", address).First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Wallet sudah terdaftar"})
		return
	}

	role := strings.TrimSpace(req.Role)
	if role == "" {
		role = "editor"
	}
	if role != "admin" && role != "editor" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Role harus 'admin' atau 'editor'"})
		return
	}

	active := true
	if req.Active != nil {
		active = *req.Active
	}

	userID, _ := c.Get("userID")
	wallet := models.AllowedWallet{
		Address:   address,
		Label:     req.Label,
		Role:      role,
		Active:    active,
		CreatedBy: userID.(uint),
	}
	if err := h.DB.Create(&wallet).Error; err != nil {
		serverError(c, err)
		return
	}
	c.JSON(http.StatusCreated, wallet)
}

func (h *Handler) AdminUpdateWallet(c *gin.Context) {
	id, ok := paramID(c)
	if !ok {
		return
	}

	var existing models.AllowedWallet
	if err := h.DB.First(&existing, id).Error; err != nil {
		notFound(c, "Wallet tidak ditemukan")
		return
	}

	var req WalletAccessRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		badRequest(c, err)
		return
	}

	// The wallet backing the current session must not be able to deactivate or
	// delete itself: that would let an admin accidentally lock everyone out,
	// including themselves, with no recovery path.
	currentWallet := c.GetString("wallet")
	self := currentWallet != "" && strings.EqualFold(currentWallet, existing.Address)
	if self && req.Active != nil && !*req.Active {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tidak dapat menonaktifkan wallet yang sedang digunakan"})
		return
	}

	if req.Address != "" {
		address, err := NormalizeAddress(req.Address)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Alamat wallet tidak valid"})
			return
		}
		if !strings.EqualFold(address, existing.Address) {
			var dup models.AllowedWallet
			if err := h.DB.Where("address = ?", address).First(&dup).Error; err == nil {
				c.JSON(http.StatusConflict, gin.H{"error": "Wallet sudah terdaftar"})
				return
			}
		}
		existing.Address = address
	}

	role := strings.TrimSpace(req.Role)
	if role != "" {
		if role != "admin" && role != "editor" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Role harus 'admin' atau 'editor'"})
			return
		}
		existing.Role = role
	}
	if req.Label != "" {
		existing.Label = req.Label
	}
	if req.Active != nil {
		existing.Active = *req.Active
	}

	if err := h.DB.Save(&existing).Error; err != nil {
		serverError(c, err)
		return
	}

	// A deactivated wallet must lose access immediately, including any live
	// sessions bound to the account it maps to.
	if !existing.Active {
		var user models.User
		if err := h.DB.Where("wallet_address = ?", existing.Address).First(&user).Error; err == nil {
			_ = middleware.RevokeAllSessionsForUser(h.DB, user.ID)
		}
	}

	c.JSON(http.StatusOK, existing)
}

func (h *Handler) AdminDeleteWallet(c *gin.Context) {
	id, ok := paramID(c)
	if !ok {
		return
	}

	var existing models.AllowedWallet
	if err := h.DB.First(&existing, id).Error; err != nil {
		notFound(c, "Wallet tidak ditemukan")
		return
	}

	currentWallet := c.GetString("wallet")
	if currentWallet != "" && strings.EqualFold(currentWallet, existing.Address) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tidak dapat menghapus wallet yang sedang digunakan"})
		return
	}

	// Drop every live session first so the removed wallet cannot keep working.
	var user models.User
	if err := h.DB.Where("wallet_address = ?", existing.Address).First(&user).Error; err == nil {
		_ = middleware.RevokeAllSessionsForUser(h.DB, user.ID)
	}

	if err := h.DB.Delete(&existing).Error; err != nil {
		serverError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Wallet berhasil dihapus"})
}

func (h *Handler) AdminGetAuditLog(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "100"))
	if limit < 1 || limit > 500 {
		limit = 100
	}

	var logs []models.AuthAuditLog
	if err := h.DB.Order("created_at desc").Limit(limit).Find(&logs).Error; err != nil {
		serverError(c, err)
		return
	}
	c.JSON(http.StatusOK, logs)
}
