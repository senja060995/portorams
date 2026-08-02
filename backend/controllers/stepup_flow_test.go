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
)

// TestWalletLoginSetsCookie verifies the session cookie is issued on wallet
// login so same-origin requests can authenticate without a JS-readable token.
func TestWalletLoginSetsCookie(t *testing.T) {
	h, engine, db := newTestHandler(t)

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

	w := doJSON(t, engine, "POST", "/api/auth/wallet/challenge", `{"address":"`+addr+`"}`, "")
	var challenge models.WalletChallengeResponse
	if err := json.Unmarshal(w.Body.Bytes(), &challenge); err != nil {
		t.Fatalf("unmarshal challenge: %v", err)
	}

	sig, err := signPersonal(priv, challenge.Message)
	if err != nil {
		t.Fatalf("sign: %v", err)
	}

	w = doJSON(t, engine, "POST", "/api/auth/wallet/verify",
		`{"address":"`+addr+`","nonce":"`+challenge.Nonce+`","signature":"`+sig+`"}`, "")
	if w.Code != http.StatusOK {
		t.Fatalf("verify status = %d body=%s", w.Code, w.Body.String())
	}

	cookie := w.Result().Cookies()
	var found bool
	for _, ck := range cookie {
		if ck.Name == middleware.SessionCookieName {
			found = true
			if !ck.HttpOnly || ck.SameSite != http.SameSiteLaxMode {
				t.Fatalf("cookie flags wrong: %+v", ck)
			}
		}
	}
	if !found {
		t.Fatal("verify did not set the session cookie")
	}
}

// TestActionStepUpFlow exercises the full destructive-action confirmation:
// challenge -> sign -> execute -> replay must be rejected.
func TestActionStepUpFlow(t *testing.T) {
	h, engine, db := newTestHandler(t)

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

	admin := engine.Group("/admin", middleware.AuthMiddleware(db))
	{
		admin.POST("/actions/challenge", h.AdminActionChallenge)
		admin.DELETE("/solutions/:id", h.RequireAction(ActionDeleteSolution, ParamIDTarget), func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"deleted": c.Param("id")})
		})
	}

	// Login.
	w := doJSON(t, engine, "POST", "/api/auth/wallet/challenge", `{"address":"`+addr+`"}`, "")
	var challenge models.WalletChallengeResponse
	if err := json.Unmarshal(w.Body.Bytes(), &challenge); err != nil {
		t.Fatalf("unmarshal challenge: %v", err)
	}
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
		t.Fatalf("unmarshal login: %v", err)
	}
	token := login.Token

	// 1. Delete without confirmation -> 403.
	w = doJSON(t, engine, "DELETE", "/admin/solutions/1", "", token)
	if w.Code != http.StatusForbidden {
		t.Fatalf("delete without step-up status = %d, want 403", w.Code)
	}

	// 2. Request a challenge for the action.
	w = doJSON(t, engine, "POST", "/admin/actions/challenge",
		`{"action":"delete.solution","target":"1"}`, token)
	if w.Code != http.StatusOK {
		t.Fatalf("challenge status = %d body=%s", w.Code, w.Body.String())
	}
	var actionChallenge struct {
		Message string `json:"message"`
		Nonce   string `json:"nonce"`
	}
	if err := json.Unmarshal(w.Body.Bytes(), &actionChallenge); err != nil {
		t.Fatalf("unmarshal action challenge: %v", err)
	}
	if !strings.Contains(actionChallenge.Message, "delete.solution") {
		t.Fatalf("message does not describe the action: %q", actionChallenge.Message)
	}

	// 3. Sign the challenge and delete with the signature.
	actionSig, err := signPersonal(priv, actionChallenge.Message)
	if err != nil {
		t.Fatalf("sign action: %v", err)
	}
	w = doJSON(t, engine, "DELETE", "/admin/solutions/1",
		`{"action_nonce":"`+actionChallenge.Nonce+`","action_signature":"`+actionSig+`"}`, token)
	if w.Code != http.StatusOK {
		t.Fatalf("delete with step-up status = %d body=%s", w.Code, w.Body.String())
	}

	// 4. Replaying the same nonce must be rejected (single use).
	w = doJSON(t, engine, "DELETE", "/admin/solutions/1",
		`{"action_nonce":"`+actionChallenge.Nonce+`","action_signature":"`+actionSig+`"}`, token)
	if w.Code != http.StatusForbidden {
		t.Fatalf("replay status = %d, want 403", w.Code)
	}
}

// TestActionNonceTiedToIP ensures a nonce issued to one client IP cannot be
// consumed from another.
func TestActionNonceTiedToIP(t *testing.T) {
	h, engine, db := newTestHandler(t)

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
	admin := engine.Group("/admin", middleware.AuthMiddleware(db))
	{
		admin.POST("/actions/challenge", h.AdminActionChallenge)
		admin.DELETE("/solutions/:id", h.RequireAction(ActionDeleteSolution, ParamIDTarget), func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"deleted": c.Param("id")})
		})
	}

	// Login as usual.
	w := doJSON(t, engine, "POST", "/api/auth/wallet/challenge", `{"address":"`+addr+`"}`, "")
	var challenge models.WalletChallengeResponse
	if err := json.Unmarshal(w.Body.Bytes(), &challenge); err != nil {
		t.Fatalf("unmarshal challenge: %v", err)
	}
	sig, err := signPersonal(priv, challenge.Message)
	if err != nil {
		t.Fatalf("sign: %v", err)
	}
	w = doJSON(t, engine, "POST", "/api/auth/wallet/verify",
		`{"address":"`+addr+`","nonce":"`+challenge.Nonce+`","signature":"`+sig+`"}`, "")
	var login models.LoginResponse
	if err := json.Unmarshal(w.Body.Bytes(), &login); err != nil {
		t.Fatalf("unmarshal login: %v", err)
	}
	token := login.Token

	// Issue a challenge from 1.2.3.4...
	w = doJSON(t, engine, "POST", "/admin/actions/challenge",
		`{"action":"delete.solution","target":"1"}`, token)
	var actionChallenge struct {
		Message string `json:"message"`
		Nonce   string `json:"nonce"`
	}
	if err := json.Unmarshal(w.Body.Bytes(), &actionChallenge); err != nil {
		t.Fatalf("unmarshal action challenge: %v", err)
	}
	actionSig, err := signPersonal(priv, actionChallenge.Message)
	if err != nil {
		t.Fatalf("sign action: %v", err)
	}

	// ...then try to consume it from a different IP (5.6.7.8).
	req := httptest.NewRequest("DELETE", "/admin/solutions/1",
		strings.NewReader(`{"action_nonce":"`+actionChallenge.Nonce+`","action_signature":"`+actionSig+`"}`))
	req.Host = "localhost:3000"
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)
	req.RemoteAddr = "5.6.7.8:1234"
	w2 := httptest.NewRecorder()
	engine.ServeHTTP(w2, req)
	if w2.Code != http.StatusForbidden {
		t.Fatalf("cross-IP consume status = %d, want 403 (body=%s)", w2.Code, w2.Body.String())
	}
}
