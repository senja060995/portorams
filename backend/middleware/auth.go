package middleware

import (
	"errors"
	"net/http"
	"os"
	"strings"
	"time"

	"rams-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"gorm.io/gorm"
)

var jwtSecret []byte

// allowedOrigins mirrors the API CORS whitelist and is used for CSRF defence
// in depth on state-changing requests.
var allowedOrigins = loadAllowedOrigins()

func loadAllowedOrigins() []string {
	raw := os.Getenv("ALLOWED_ORIGINS")
	if raw == "" {
		raw = "http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,https://rams.biz.id"
	}
	origins := []string{}
	for _, o := range strings.Split(raw, ",") {
		if trimmed := strings.TrimSpace(o); trimmed != "" && trimmed != "*" {
			origins = append(origins, strings.TrimRight(trimmed, "/"))
		}
	}
	return origins
}

func originAllowed(origin string) bool {
	origin = strings.TrimRight(origin, "/")
	for _, o := range allowedOrigins {
		if o == origin {
			return true
		}
	}
	return false
}

// InitJWTSecret loads the signing key from the environment. It returns an
// error instead of falling back to a baked-in default so a misconfigured
// deployment fails loudly rather than shipping a publicly known secret.
func InitJWTSecret() error {
	secret := os.Getenv("JWT_SECRET")
	if len(strings.TrimSpace(secret)) < 32 {
		return errors.New("JWT_SECRET must be set and at least 32 characters long")
	}
	jwtSecret = []byte(secret)
	return nil
}

// SessionTTL is how long an admin session stays valid before it must be
// refreshed by signing in again. Short enough that a stolen token is useful
// for a limited window, long enough to not be annoying during a work day.
// Sessions are extended while the user is active (see AuthMiddleware).
const SessionTTL = 1 * time.Hour

// SessionCookieName is the httpOnly cookie that carries the bearer token. It
// is set on login and read as a fallback when no Authorization header is sent,
// so the JWT never has to be readable from JavaScript.
const SessionCookieName = "rams_session"

type Claims struct {
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	Wallet   string `json:"wallet"`
	JTI      string `json:"jti"`
	jwt.RegisteredClaims
}

// GenerateToken issues a signed JWT carrying the caller's identity plus a
// unique session id (jti). The token is only honoured while a matching,
// non-revoked AdminSession row exists in the database.
func GenerateToken(userID uint, username, role, wallet, jti string) (string, error) {
	if len(jwtSecret) == 0 {
		return "", errors.New("jwt secret not initialised")
	}
	now := time.Now()
	claims := &Claims{
		UserID:   userID,
		Username: username,
		Role:     role,
		Wallet:   wallet,
		JTI:      jti,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(now.Add(SessionTTL)),
			IssuedAt:  jwt.NewNumericDate(now),
			ID:        jti,
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

// bearerToken extracts the JWT from the Authorization header or, when the
// header is absent, from the httpOnly session cookie. The cookie path keeps
// the token out of reach of JavaScript while still working across same-origin
// requests without a client-side store.
func bearerToken(c *gin.Context) string {
	if authHeader := c.GetHeader("Authorization"); authHeader != "" {
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) == 2 && parts[0] == "Bearer" {
			return parts[1]
		}
		return ""
	}
	if cookie, err := c.Cookie(SessionCookieName); err == nil {
		return cookie
	}
	return ""
}

// AuthMiddleware verifies the bearer token and then confirms the referenced
// session is still live in the database, so revoking a session (logout, wallet
// deactivation) invalidates the token immediately rather than at expiry. An
// active session is slid forward so long-lived editing sessions stay valid.
func AuthMiddleware(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		rawToken := bearerToken(c)
		if rawToken == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header missing"})
			return
		}

		// CSRF defence in depth: a state-changing request carrying an Origin
		// must come from an allowed site. SameSite=Lax already stops cookies
		// on cross-site POSTs; this also blocks a malicious page that somehow
		// obtains the bearer token.
		if c.Request.Method == http.MethodPost || c.Request.Method == http.MethodPut || c.Request.Method == http.MethodDelete {
			if origin := c.GetHeader("Origin"); origin != "" && !originAllowed(origin) {
				c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Origin tidak diizinkan"})
				return
			}
		}

		claims := &Claims{}
		token, err := jwt.ParseWithClaims(rawToken, claims, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, errors.New("unexpected signing method")
			}
			return jwtSecret, nil
		}, jwt.WithValidMethods([]string{"HS256"}))

		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			return
		}
		if claims.JTI == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			return
		}

		var session models.AdminSession
		err = db.Where("jti = ? AND user_id = ? AND revoked_at IS NULL AND expires_at > ?",
			claims.JTI, claims.UserID, time.Now()).First(&session).Error
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Sesi berakhir. Silakan masuk kembali."})
			return
		}

		// Sliding window: extend the session when less than half of its TTL
		// remains, so an actively-used session never expires mid-editing while
		// an idle one still lapses.
		if session.ExpiresAt.Before(time.Now().Add(SessionTTL / 2)) {
			newExpiry := time.Now().Add(SessionTTL)
			_ = db.Model(&models.AdminSession{}).
				Where("id = ? AND revoked_at IS NULL", session.ID).
				Update("expires_at", newExpiry)
		}

		c.Set("userID", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("role", claims.Role)
		c.Set("wallet", claims.Wallet)
		c.Set("jti", claims.JTI)
		c.Next()
	}
}

// SetSessionCookie stores the bearer token in an httpOnly, Secure, SameSite=Lax
// cookie. httpOnly keeps it out of reach of any injected script; SameSite=Lax
// still sends it on same-site navigation while blocking cross-site POSTs.
func SetSessionCookie(c *gin.Context, token string) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(SessionCookieName, token, int(SessionTTL.Seconds()), "/", "", true, true)
}

// ClearSessionCookie expires the session cookie.
func ClearSessionCookie(c *gin.Context) {
	c.SetCookie(SessionCookieName, "", -1, "/", "", false, true)
}

// RevokeSession marks a jti as revoked so its token stops working. It is safe
// to call for ids that do not exist yet.
func RevokeSession(db *gorm.DB, jti string) error {
	now := time.Now()
	return db.Model(&models.AdminSession{}).
		Where("jti = ? AND revoked_at IS NULL", jti).
		Update("revoked_at", &now).Error
}

// RevokeAllSessionsForUser kills every live session for a user. Used when a
// wallet is deactivated so existing logins are cut off immediately.
func RevokeAllSessionsForUser(db *gorm.DB, userID uint) error {
	now := time.Now()
	return db.Model(&models.AdminSession{}).
		Where("user_id = ? AND revoked_at IS NULL", userID).
		Update("revoked_at", &now).Error
}

// RequireRole gates a route to the listed roles. Must run after AuthMiddleware.
func RequireRole(roles ...string) gin.HandlerFunc {
	allowed := make(map[string]struct{}, len(roles))
	for _, r := range roles {
		allowed[r] = struct{}{}
	}
	return func(c *gin.Context) {
		role, _ := c.Get("role")
		roleStr, ok := role.(string)
		if !ok {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Role not present in token"})
			return
		}
		if _, permitted := allowed[roleStr]; !permitted {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Insufficient privileges"})
			return
		}
		c.Next()
	}
}
