package controllers

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"
)

// notifyTelegram sends a security alert to a Telegram chat via the Bot API.
// It is best-effort and non-blocking; if TELEGRAM_BOT_TOKEN or
// TELEGRAM_CHAT_ID is not configured it is a silent no-op, so the feature can
// be switched on purely by setting environment variables.
func notifyTelegram(text string) {
	token := os.Getenv("TELEGRAM_BOT_TOKEN")
	chatID := os.Getenv("TELEGRAM_CHAT_ID")
	if token == "" || chatID == "" {
		return
	}

	go func() {
		payload, err := json.Marshal(map[string]string{
			"chat_id":                  chatID,
			"text":                     text,
			"disable_web_page_preview": "true",
		})
		if err != nil {
			return
		}
		req, err := http.NewRequest(http.MethodPost, "https://api.telegram.org/bot"+token+"/sendMessage", bytes.NewReader(payload))
		if err != nil {
			return
		}
		req.Header.Set("Content-Type", "application/json")

		client := &http.Client{Timeout: 10 * time.Second}
		resp, err := client.Do(req)
		if err != nil {
			log.Printf("⚠️ Telegram alert failed: %v", err)
			return
		}
		defer resp.Body.Close()
		if resp.StatusCode != http.StatusOK {
			log.Printf("⚠️ Telegram alert returned status %d", resp.StatusCode)
		}
	}()
}
