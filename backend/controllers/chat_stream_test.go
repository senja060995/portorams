package controllers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"rams-backend/models"
)

// TestChatBotStreamsNDJSON drives the real handler with no AI key configured,
// so it exercises the keyword fallback through the streaming path.
func TestChatBotStreamsNDJSON(t *testing.T) {
	h, engine, db := newTestHandler(t)
	if err := db.AutoMigrate(&models.SiteSetting{}); err != nil {
		t.Fatalf("migrate site_settings: %v", err)
	}
	engine.POST("/chat", h.ChatBot)
	if err := db.Create(&models.SiteSetting{Key: "whatsapp", ValueID: "6281200000000"}).Error; err != nil {
		t.Fatalf("seed whatsapp: %v", err)
	}

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPost, "/chat",
		strings.NewReader(`{"message":"berapa harga ERP?","locale":"id"}`))
	req.Header.Set("Content-Type", "application/json")
	engine.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200 (body: %s)", w.Code, w.Body.String())
	}
	if ct := w.Header().Get("Content-Type"); !strings.HasPrefix(ct, "application/x-ndjson") {
		t.Fatalf("content-type = %q, want application/x-ndjson", ct)
	}

	type event struct {
		Type     string        `json:"type"`
		Intent   string        `json:"intent"`
		Text     string        `json:"text"`
		Redirect *ChatRedirect `json:"redirect"`
	}

	var sawMeta, sawDelta, sawDone bool
	for _, line := range strings.Split(strings.TrimSpace(w.Body.String()), "\n") {
		if line == "" {
			continue
		}
		var ev event
		if err := json.Unmarshal([]byte(line), &ev); err != nil {
			t.Fatalf("invalid NDJSON line %q: %v", line, err)
		}
		switch ev.Type {
		case "meta":
			sawMeta = true
			if ev.Intent != "price" {
				t.Errorf("meta.intent = %q, want price", ev.Intent)
			}
			if ev.Redirect == nil {
				t.Error("meta.redirect is nil for a price question")
			} else if ev.Redirect.URL == "" {
				t.Error("meta.redirect.url is empty")
			}
		case "delta":
			sawDelta = true
			if strings.TrimSpace(ev.Text) == "" {
				t.Error("delta with empty text")
			}
		case "done":
			sawDone = true
		default:
			t.Errorf("unexpected event type %q", ev.Type)
		}
	}

	if !sawMeta || !sawDelta || !sawDone {
		t.Errorf("stream missing events: meta=%v delta=%v done=%v", sawMeta, sawDelta, sawDone)
	}
}

func TestChatBotRejectsEmptyMessage(t *testing.T) {
	h, engine, _ := newTestHandler(t)
	engine.POST("/chat", h.ChatBot)

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPost, "/chat",
		strings.NewReader(`{"message":"   ","locale":"id"}`))
	req.Header.Set("Content-Type", "application/json")
	engine.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want 400", w.Code)
	}
}
