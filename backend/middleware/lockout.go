package middleware

import (
	"sync"
	"time"
)

// failureEntry tracks consecutive authentication failures for one key
// (a wallet address and/or client IP) within a sliding window.
type failureEntry struct {
	count int
	first time.Time
}

// Lockout is an in-memory brute-force guard. Keys are combination strings such
// as "addr:0x…|ip:1.2.3.4" so an attacker rotating IPs still hits the address
// limit, and an attacker trying many addresses from one IP hits the IP limit.
// State lives in memory only; a restart clears the counters, which is
// acceptable for a single-node deployment.
type Lockout struct {
	mu       sync.Mutex
	failures map[string]*failureEntry
}

func NewLockout() *Lockout {
	return &Lockout{failures: make(map[string]*failureEntry)}
}

// FailureKey builds a canonical key for the given parts, dropping empties.
func FailureKey(parts ...string) string {
	key := ""
	for _, p := range parts {
		if p == "" {
			continue
		}
		if key != "" {
			key += "|"
		}
		key += p
	}
	return key
}

// IsBlocked returns true when the key has accumulated maxFailures or more
// failures inside the window, along with how long remains until it unlocks.
func (l *Lockout) IsBlocked(key string, maxFailures int, window time.Duration) (bool, time.Duration) {
	l.mu.Lock()
	defer l.mu.Unlock()

	entry, ok := l.failures[key]
	if !ok {
		return false, 0
	}
	now := time.Now()
	if now.Sub(entry.first) >= window {
		delete(l.failures, key)
		return false, 0
	}
	if entry.count >= maxFailures {
		return true, window - now.Sub(entry.first)
	}
	return false, 0
}

func (l *Lockout) RegisterFailure(key string) {
	l.mu.Lock()
	defer l.mu.Unlock()

	now := time.Now()
	entry, ok := l.failures[key]
	if !ok {
		entry = &failureEntry{count: 1, first: now}
		l.failures[key] = entry
		return
	}
	entry.count++
}

func (l *Lockout) Reset(key string) {
	l.mu.Lock()
	defer l.mu.Unlock()
	delete(l.failures, key)
}
