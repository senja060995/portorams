package controllers

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"

	"rams-backend/models"

	"github.com/gin-gonic/gin"
)

// Destructive admin actions that require a fresh wallet signature (step-up
// verification) before they are executed.
const (
	ActionDeleteSolution    = "delete.solution"
	ActionDeleteProduct     = "delete.product"
	ActionDeleteArticle     = "delete.article"
	ActionDeletePartner     = "delete.partner"
	ActionDeleteValueProp   = "delete.value_prop"
	ActionDeleteApproachStep = "delete.approach_step"
	ActionDeleteInquiry     = "delete.inquiry"
	ActionDeleteMedia       = "delete.media"
	ActionDeleteWallet      = "delete.wallet"
	ActionCreateWallet      = "create.wallet"
	ActionUpdateWallet      = "update.wallet"
)

var actionNonceTTL = 3 * time.Minute

var errActionUnauthorized = errors.New("konfirmasi tanda tangan tidak valid atau kedaluwarsa")

var allowedActions = map[string]bool{
	ActionDeleteSolution:     true,
	ActionDeleteProduct:      true,
	ActionDeleteArticle:      true,
	ActionDeletePartner:      true,
	ActionDeleteValueProp:    true,
	ActionDeleteApproachStep: true,
	ActionDeleteInquiry:      true,
	ActionDeleteMedia:        true,
	ActionDeleteWallet:       true,
	ActionCreateWallet:       true,
	ActionUpdateWallet:       true,
}

// ActionChallengeRequest asks for a signing challenge for one destructive
// action. The target is the entity identifier the action will be applied to.
type ActionChallengeRequest struct {
	Action string `json:"action" binding:"required,max=64"`
	Target string `json:"target" binding:"required,max=200"`
}

// BuildActionMessage renders the exact text the admin signs to confirm a
// destructive action. It is produced server-side only.
func BuildActionMessage(domain, action, target, nonce string, expiresAt time.Time) string {
	return fmt.Sprintf("RAMS CMS - Konfirmasi aksi\n\nAksi: %s\nTarget: %s\nDomain: %s\nNonce: %s\nBerlaku hingga: %s",
		action, target, domain, nonce, expiresAt.UTC().Format(time.RFC3339))
}

// AdminActionChallenge issues a short-lived, session-bound challenge for a
// destructive action. The frontend shows it to the user, they sign it with
// their wallet, and the signature is submitted alongside the action itself.
func (h *Handler) AdminActionChallenge(c *gin.Context) {
	var req ActionChallengeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		badRequest(c, err)
		return
	}
	if !allowedActions[req.Action] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Aksi tidak valid"})
		return
	}

	jti := c.GetString("jti")
	wallet := c.GetString("wallet")
	if jti == "" || wallet == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Sesi tidak valid"})
		return
	}

	nonce := randomNonce()
	issuedAt := time.Now()
	expiresAt := issuedAt.Add(actionNonceTTL)
	record := models.ActionNonce{
		Nonce:     nonce,
		Jti:       jti,
		Action:    req.Action,
		Target:    req.Target,
		IP:        c.ClientIP(),
		IssuedAt:  issuedAt,
		ExpiresAt: expiresAt,
	}
	if err := h.DB.Create(&record).Error; err != nil {
		serverError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    BuildActionMessage(h.SiweDomain, req.Action, req.Target, nonce, expiresAt),
		"nonce":      nonce,
		"action":     req.Action,
		"target":     req.Target,
		"expires_at": expiresAt,
	})
}

// RequireAction is a per-route gate for destructive actions. It reads the
// signed challenge from the request body (leaving the body intact for the
// handler), verifies it belongs to this session/action/target, and consumes it
// atomically so it can never be replayed.
func (h *Handler) RequireAction(action string, targetFn func(*gin.Context) string) gin.HandlerFunc {
	return func(c *gin.Context) {
		raw, err := io.ReadAll(io.LimitReader(c.Request.Body, 1<<20))
		if err != nil {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Gagal membaca permintaan"})
			return
		}
		c.Request.Body = io.NopCloser(bytes.NewBuffer(raw))

		if len(bytes.TrimSpace(raw)) == 0 {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Konfirmasi tanda tangan diperlukan untuk aksi ini"})
			return
		}

		var payload struct {
			ActionNonce     string `json:"action_nonce"`
			ActionSignature string `json:"action_signature"`
		}
		if err := json.Unmarshal(raw, &payload); err != nil || payload.ActionNonce == "" || payload.ActionSignature == "" {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Konfirmasi tanda tangan diperlukan untuk aksi ini"})
			return
		}

		if err := h.consumeActionNonce(c.GetString("jti"), c.GetString("wallet"), action, targetFn(c), payload.ActionNonce, payload.ActionSignature, c.ClientIP()); err != nil {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.Next()
	}
}

// consumeActionNonce atomically consumes the nonce and verifies the signature
// recovers to the wallet of the current session. Every field is bound: the
// nonce must belong to this session, action, target and IP, and be unused and
// unexpired.
func (h *Handler) consumeActionNonce(jti, wallet, action, target, nonce, signature, ip string) error {
	var record models.ActionNonce
	if err := h.DB.Where("nonce = ?", nonce).First(&record).Error; err != nil {
		return errActionUnauthorized
	}
	if record.Jti != jti || record.Action != action || record.Target != target {
		return errActionUnauthorized
	}
	if record.UsedAt != nil || !time.Now().Before(record.ExpiresAt) {
		return errActionUnauthorized
	}
	if record.IP != "" && record.IP != ip {
		return errActionUnauthorized
	}

	now := time.Now()
	res := h.DB.Model(&models.ActionNonce{}).
		Where("id = ? AND used_at IS NULL", record.ID).
		Update("used_at", &now)
	if res.Error != nil || res.RowsAffected != 1 {
		return errActionUnauthorized
	}

	message := BuildActionMessage(h.SiweDomain, action, target, nonce, record.ExpiresAt)
	signer, err := RecoverAddress(message, signature)
	if err != nil || signer != wallet {
		return errActionUnauthorized
	}
	return nil
}

// ParamIDTarget extracts the :id path parameter as the action target.
func ParamIDTarget(c *gin.Context) string {
	return c.Param("id")
}

// BodyAddressTarget extracts a normalized wallet address from the request body
// (used when creating allowlist entries), leaving the body intact for the
// handler that follows.
func BodyAddressTarget(c *gin.Context) string {
	raw, err := io.ReadAll(io.LimitReader(c.Request.Body, 1<<20))
	if err != nil {
		return ""
	}
	c.Request.Body = io.NopCloser(bytes.NewBuffer(raw))

	var payload struct {
		Address string `json:"address"`
	}
	if err := json.Unmarshal(raw, &payload); err != nil {
		return ""
	}
	address, err := NormalizeAddress(payload.Address)
	if err != nil {
		return ""
	}
	return address
}
