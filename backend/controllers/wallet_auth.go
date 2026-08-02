package controllers

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"strings"
	"time"

	"rams-backend/middleware"
	"rams-backend/models"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

const (
	nonceTTL        = 5 * time.Minute
	lockoutMax      = 5
	lockoutWindow   = 15 * time.Minute
	lockoutCooldown = 15 * time.Second
)

// randomNonce returns a 256-bit random hex string used as a one-time challenge.
func randomNonce() string {
	buf := make([]byte, 32)
	if _, err := rand.Read(buf); err != nil {
		// crypto/rand failure is fatal for authentication; panic is loud and
		// forces a restart instead of shipping predictable nonces.
		panic(err)
	}
	return hex.EncodeToString(buf)
}

// WalletChallenge issues a signed-message challenge. The full EIP-4361 message
// is assembled here, not on the client, so the domain, chain id and timestamps
// the user approves are exactly the ones the server will verify.
func (h *Handler) WalletChallenge(c *gin.Context) {
	var req models.WalletChallengeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		badRequest(c, err)
		return
	}

	address, err := NormalizeAddress(req.Address)
	if err != nil {
		// Deliberately indistinguishable from "not allowed" so the endpoint
		// cannot be used to probe the allowlist.
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Wallet tidak diizinkan"})
		return
	}

	// Unknown or inactive wallets get the same generic response; only a valid,
	// active allowlist entry yields a challenge.
	var allowed models.AllowedWallet
	if err := h.DB.Where("address = ? AND active = ?", address, true).First(&allowed).Error; err != nil {
		h.auditFailure(c, address, "not_allowlisted")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Wallet tidak diizinkan"})
		return
	}

	nonce := randomNonce()
	issuedAt := time.Now()
	expiresAt := issuedAt.Add(nonceTTL)

	record := models.WalletNonce{
		Nonce:     nonce,
		Address:   address,
		IP:        c.ClientIP(),
		IssuedAt:  issuedAt,
		ExpiresAt: expiresAt,
	}
	if err := h.DB.Create(&record).Error; err != nil {
		serverError(c, err)
		return
	}

	message := BuildSIWEMessage(h.SiweDomain, h.SiweURI, h.ChainID, address, nonce, issuedAt, expiresAt)

	c.JSON(http.StatusOK, models.WalletChallengeResponse{
		Message: message,
		Nonce:   nonce,
		Address: ChecksummedAddress(address),
		ChainID: h.ChainID,
	})
}

// WalletVerify consumes the nonce, recovers the signer from the EIP-191
// signature and, only when every check passes, issues a session-bound JWT.
func (h *Handler) WalletVerify(c *gin.Context) {
	var req models.WalletVerifyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		badRequest(c, err)
		return
	}

	address, err := NormalizeAddress(req.Address)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Kredensial tidak valid"})
		return
	}

	// Brute-force guard keyed on address and IP independently.
	ip := c.ClientIP()
	key := middleware.FailureKey("addr:"+address, "ip:"+ip)
	if blocked, wait := h.Lockout.IsBlocked(key, lockoutMax, lockoutWindow); blocked {
		c.Header("Retry-After", wait.String())
		h.auditFailure(c, address, "locked_out")
		c.JSON(http.StatusTooManyRequests, gin.H{"error": "Terlalu banyak percobaan. Coba lagi beberapa saat."})
		return
	}

	// (1) Fetch the nonce; it must exist, be bound to this address, be unused
	// and still be within its time window.
	var nonce models.WalletNonce
	if err := h.DB.Where("nonce = ?", req.Nonce).First(&nonce).Error; err != nil {
		h.Lockout.RegisterFailure(key)
		h.auditFailure(c, address, "bad_nonce")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Kredensial tidak valid"})
		return
	}
	if !strings.EqualFold(nonce.Address, address) || nonce.UsedAt != nil || !time.Now().Before(nonce.ExpiresAt) {
		h.Lockout.RegisterFailure(key)
		h.auditFailure(c, address, "bad_nonce")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Kredensial tidak valid"})
		return
	}

	// (2) Atomically consume the nonce so it can never be replayed, even if
	// the signature that follows is invalid.
	now := time.Now()
	res := h.DB.Model(&models.WalletNonce{}).
		Where("id = ? AND used_at IS NULL", nonce.ID).
		Update("used_at", &now)
	if res.Error != nil || res.RowsAffected != 1 {
		h.Lockout.RegisterFailure(key)
		h.auditFailure(c, address, "bad_nonce")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Kredensial tidak valid"})
		return
	}

	// (3) Rebuild the exact message that must have been signed and recover the
	// signer. The client never supplies the message body, so it cannot
	// influence what is verified.
	message := BuildSIWEMessage(h.SiweDomain, h.SiweURI, h.ChainID, address, req.Nonce, nonce.IssuedAt, nonce.ExpiresAt)
	signer, err := RecoverAddress(message, req.Signature)
	if err != nil {
		h.Lockout.RegisterFailure(key)
		h.auditFailure(c, address, "bad_signature")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Kredensial tidak valid"})
		return
	}
	if signer != address {
		h.Lockout.RegisterFailure(key)
		h.auditFailure(c, address, "signer_mismatch")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Kredensial tidak valid"})
		return
	}

	// (4) The recovered signer must be on the active allowlist.
	var allowed models.AllowedWallet
	if err := h.DB.Where("address = ? AND active = ?", address, true).First(&allowed).Error; err != nil {
		h.Lockout.RegisterFailure(key)
		h.auditFailure(c, address, "not_allowlisted")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Kredensial tidak valid"})
		return
	}

	// (5) Locate or provision the CMS account bound to this wallet.
	user, err := h.ensureWalletUser(address, allowed.Role)
	if err != nil {
		serverError(c, err)
		return
	}
	if user.Role != allowed.Role {
		h.DB.Model(&models.User{}).Where("id = ?", user.ID).Update("role", allowed.Role)
		user.Role = allowed.Role
	}

	// (6) Open a revocable session and issue the JWT bound to it.
	jti := randomNonce()
	session := models.AdminSession{
		Jti:       jti,
		UserID:    user.ID,
		IP:        ip,
		UserAgent: c.Request.UserAgent(),
		ExpiresAt: time.Now().Add(middleware.SessionTTL),
	}
	if err := h.DB.Create(&session).Error; err != nil {
		serverError(c, err)
		return
	}

	token, err := middleware.GenerateToken(user.ID, user.Username, user.Role, address, jti)
	if err != nil {
		serverError(c, err)
		return
	}

	h.DB.Model(&models.User{}).Where("id = ?", user.ID).Update("last_login_at", time.Now())
	h.Lockout.Reset(key)
	h.auditSuccess(c, address)

	c.JSON(http.StatusOK, models.LoginResponse{Token: token, User: *user})
}

// ensureWalletUser returns the CMS account tied to a wallet, creating it on
// first sign-in. The generated password is random and unusable because
// password login is disabled; the account is exclusively wallet-authenticated.
func (h *Handler) ensureWalletUser(address, role string) (*models.User, error) {
	var user models.User
	if err := h.DB.Where("wallet_address = ?", address).First(&user).Error; err == nil {
		return &user, nil
	}

	randomPassword, err := bcrypt.GenerateFromPassword(randomBytes(32), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}
	username := "wallet-" + address[2:10]
	user = models.User{
		Username:      username,
		Email:         username + "@wallet.local",
		Password:      string(randomPassword),
		Role:          role,
		WalletAddress: address,
	}
	if err := h.DB.Create(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func randomBytes(n int) []byte {
	buf := make([]byte, n)
	if _, err := rand.Read(buf); err != nil {
		panic(err)
	}
	return buf
}

func (h *Handler) auditFailure(c *gin.Context, address, reason string) {
	h.DB.Create(&models.AuthAuditLog{
		Address:   address,
		IP:        c.ClientIP(),
		UserAgent: c.Request.UserAgent(),
		Outcome:   "failure",
		Reason:    reason,
	})
}

func (h *Handler) auditSuccess(c *gin.Context, address string) {
	h.DB.Create(&models.AuthAuditLog{
		Address:   address,
		IP:        c.ClientIP(),
		UserAgent: c.Request.UserAgent(),
		Outcome:   "success",
		Reason:    "wallet_login",
	})
}
