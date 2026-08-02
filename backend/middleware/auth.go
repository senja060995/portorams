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
const SessionTTL = 1 * time.Hour

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

// AuthMiddleware verifies the bearer token and then confirms the referenced
// session is still live in the database, so revoking a session (logout, wallet
// deactivation) invalidates the token immediately rather than at expiry.
func AuthMiddleware(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header missing"})
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid Authorization header format"})
			return
		}

		claims := &Claims{}
		token, err := jwt.ParseWithClaims(parts[1], claims, func(t *jwt.Token) (interface{}, error) {
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

		c.Set("userID", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("role", claims.Role)
		c.Set("wallet", claims.Wallet)
		c.Set("jti", claims.JTI)
		c.Next()
	}
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
