package controllers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"rams-backend/middleware"
	"rams-backend/models"

	"github.com/ethereum/go-ethereum/crypto"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func newTestHandler(t *testing.T) (*Handler, *gin.Engine, *gorm.DB) {
	t.Helper()
	gin.SetMode(gin.TestMode)

	t.Setenv("JWT_SECRET", "test-secret-0123456789abcdefghijklmnopqrstuv")
	if err := middleware.InitJWTSecret(); err != nil {
		t.Fatalf("init jwt: %v", err)
	}

	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("open db: %v", err)
	}
	if err := db.AutoMigrate(&models.User{}, &models.AllowedWallet{}, &models.WalletNonce{}, &models.AdminSession{}, &models.ActionNonce{}, &models.AuthAuditLog{}); err != nil {
		t.Fatalf("migrate: %v", err)
	}

	h := NewHandler(db, "", "", "localhost:3000", "http://localhost:3000", 1, "", "", "")
	engine := gin.New()
	return h, engine, db
}

func doJSON(t *testing.T, engine *gin.Engine, method, path, body string, auth string) *httptest.ResponseRecorder {
	t.Helper()
	req := httptest.NewRequest(method, path, strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	if auth != "" {
		req.Header.Set("Authorization", "Bearer "+auth)
	}
	w := httptest.NewRecorder()
	req.Host = "localhost:3000"
	engine.ServeHTTP(w, req)
	return w
}

func TestWalletLoginFlow(t *testing.T) {
	h, engine, db := newTestHandler(t)

	// Allowlist a freshly generated wallet.
	priv, err := crypto.GenerateKey()
	if err != nil {
		t.Fatalf("GenerateKey: %v", err)
	}
	addr := strings.ToLower(crypto.PubkeyToAddress(priv.PublicKey).Hex())
	if err := db.Create(&models.AllowedWallet{Address: addr, Role: "admin", Active: true}).Error; err != nil {
		t.Fatalf("seed wallet: %v", err)
	}

	engine.POST("/api/auth/wallet/challenge", h.WalletChallenge)
	engine.POST("/api/auth/wallet/verify", h.WalletVerify)

	// 1. Challenge.
	w := doJSON(t, engine, "POST", "/api/auth/wallet/challenge", `{"address":"`+addr+`"}`, "")
	if w.Code != http.StatusOK {
		t.Fatalf("challenge status = %d body=%s", w.Code, w.Body.String())
	}
	var challenge models.WalletChallengeResponse
	if err := json.Unmarshal(w.Body.Bytes(), &challenge); err != nil {
		t.Fatalf("unmarshal challenge: %v", err)
	}

	// 2. Sign the exact message and verify.
	sig, err := signPersonal(priv, challenge.Message)
	if err != nil {
		t.Fatalf("sign: %v", err)
	}

	w = doJSON(t, engine, "POST", "/api/auth/wallet/verify",
		`{"address":"`+addr+`","nonce":"`+challenge.Nonce+`","signature":"`+sig+`"}`, "")
	if w.Code != http.StatusOK {
		t.Fatalf("verify status = %d body=%s", w.Code, w.Body.String())
	}
	var login models.LoginResponse
	if err := json.Unmarshal(w.Body.Bytes(), &login); err != nil {
		t.Fatalf("unmarshal verify: %v", err)
	}
	if login.Token == "" || login.User.WalletAddress != addr {
		t.Fatalf("unexpected login response: %+v", login.User)
	}

	// 3. The issued token passes the auth middleware (session exists).
	engine.GET("/admin/me", middleware.AuthMiddleware(db), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"user_id": c.GetUint("userID")})
	})
	w = doJSON(t, engine, "GET", "/admin/me", "", login.Token)
	if w.Code != http.StatusOK {
		t.Fatalf("me status = %d body=%s", w.Code, w.Body.String())
	}

	// 4. Replaying the same nonce must fail (single use).
	w = doJSON(t, engine, "POST", "/api/auth/wallet/verify",
		`{"address":"`+addr+`","nonce":"`+challenge.Nonce+`","signature":"`+sig+`"}`, "")
	if w.Code != http.StatusUnauthorized {
		t.Fatalf("replay status = %d, want 401", w.Code)
	}
}
