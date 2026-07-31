package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type visitor struct {
	timestamps []time.Time
}

// RateLimit allows at most `limit` requests per `window` per client IP.
// In-memory only, so it resets on restart and does not coordinate across
// instances; adequate for protecting a public contact form on a single node.
func RateLimit(limit int, window time.Duration) gin.HandlerFunc {
	var mu sync.Mutex
	visitors := make(map[string]*visitor)
	lastSweep := time.Now()

	return func(c *gin.Context) {
		ip := c.ClientIP()
		now := time.Now()

		mu.Lock()
		if now.Sub(lastSweep) > window {
			for key, v := range visitors {
				if len(v.timestamps) == 0 || now.Sub(v.timestamps[len(v.timestamps)-1]) > window {
					delete(visitors, key)
				}
			}
			lastSweep = now
		}

		v, exists := visitors[ip]
		if !exists {
			v = &visitor{}
			visitors[ip] = v
		}

		kept := v.timestamps[:0]
		for _, ts := range v.timestamps {
			if now.Sub(ts) <= window {
				kept = append(kept, ts)
			}
		}
		v.timestamps = kept

		if len(v.timestamps) >= limit {
			retryAfter := window - now.Sub(v.timestamps[0])
			mu.Unlock()
			c.Header("Retry-After", time.Now().Add(retryAfter).UTC().Format(time.RFC1123))
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": "Terlalu banyak permintaan. Silakan coba lagi nanti.",
			})
			return
		}

		v.timestamps = append(v.timestamps, now)
		mu.Unlock()

		c.Next()
	}
}
