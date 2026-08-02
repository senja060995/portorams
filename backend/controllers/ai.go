package controllers

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"

	"rams-backend/models"
)

// aiEnabled reports whether an AI provider is configured for the chat bot.
func (h *Handler) aiEnabled() bool {
	return h.AIAPIKey != "" && h.AIModel != ""
}

// aiSettings loads the contact details used to ground the AI's answers.
func (h *Handler) aiSettings() map[string]string {
	out := map[string]string{}
	var rows []models.SiteSetting
	if err := h.DB.Select("key", "value_id").Find(&rows).Error; err != nil {
		return out
	}
	for _, row := range rows {
		out[row.Key] = row.ValueID
	}
	return out
}

// aiSystemPrompt builds the persona that keeps replies sounding human: a short,
// friendly customer service rep for RAMS that never advertises itself as AI and
// never invents prices.
func aiSystemPrompt(locale string, settings map[string]string) string {
	company := or(settings["company_name"], "PT Ragam Manfaat Sinergi (RAMS)")
	whatsapp := settings["whatsapp"]
	email := settings["email"]
	phone := settings["phone"]

	if locale == "en" {
		return fmt.Sprintf(`You are Nadia, a customer service representative for %s, an Indonesian software company.
Write the way a real person texts on WhatsApp: short, warm, natural. Never mention AI, being a model, or any assistant persona. No markdown, no asterisks, no bullet lists, no emojis.

Company context:
- Services: Enterprise ERP, Offline-First POS, Ticketing & Event, Logistics & Warehouse, Custom Software.
- Contacts: WhatsApp %s, email %s, phone %s.
- The website has Solutions, Product (SIDRA), News, and Contact pages.

Rules:
- If the customer asks about PRICE or cost, never give a number. Answer briefly and warmly that pricing depends on their needs, and invite them to continue on WhatsApp (a WhatsApp button will appear below your answer).
- If you do not know something, point them to the contact page or Solutions page. Do not invent facts.
- Answer in English, in 1-3 short sentences.`, company, whatsapp, email, phone)
	}

	return fmt.Sprintf(`Kamu adalah Nadia, customer service dari %s, perusahaan pengembang perangkat lunak di Indonesia.
Tulislah seperti orang asli yang chat WhatsApp: singkat, ramah, natural. Jangan pernah menyebut AI, jadi model, atau asisten virtual. Tanpa markdown, tanpa asterisk, tanpa daftar, tanpa emoji.

Konteks perusahaan:
- Layanan: ERP Enterprise, POS Offline-First, Ticketing & Event, Logistik & Gudang, Perangkat Lunak Kustom.
- Kontak: WhatsApp %s, email %s, telepon %s.
- Website punya halaman Solusi, Produk (SIDRA), Berita, dan Kontak.

Aturan:
- Kalau pelanggan bertanya soal HARGA/biaya, jangan pernah menyebut angka. Jawab singkat dan ramah bahwa penawaran disesuaikan kebutuhan, lalu ajak lanjut chat WhatsApp (tombol WhatsApp akan muncul di bawah jawabanmu).
- Kalau tidak tahu, arahkan ke halaman Kontak atau Solusi. Jangan mengarang fakta.
- Jawab dalam Bahasa Indonesia, 1-3 kalimat singkat.`, company, whatsapp, email, phone)
}

func or(value, fallback string) string {
	if strings.TrimSpace(value) != "" {
		return value
	}
	return fallback
}

// streamAI calls an OpenAI-compatible chat completions endpoint with streaming
// enabled and forwards each text delta to onText. Cancelling ctx aborts the
// upstream request.
func (h *Handler) streamAI(ctx context.Context, systemPrompt, userMessage string, onText func(string)) error {
	url := strings.TrimRight(h.AIBaseURL, "/") + "/chat/completions"
	payload := map[string]any{
		"model":       h.AIModel,
		"stream":      true,
		"temperature": 0.6,
		"max_tokens":  250,
		"messages": []map[string]string{
			{"role": "system", "content": systemPrompt},
			{"role": "user", "content": userMessage},
		},
	}
	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+h.AIAPIKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		detail, _ := io.ReadAll(io.LimitReader(resp.Body, 512))
		return fmt.Errorf("AI API status %d: %s", resp.StatusCode, strings.TrimSpace(string(detail)))
	}

	scanner := bufio.NewScanner(resp.Body)
	scanner.Buffer(make([]byte, 64*1024), 1024*1024)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if !strings.HasPrefix(line, "data:") {
			continue
		}
		data := strings.TrimSpace(strings.TrimPrefix(line, "data:"))
		if data == "[DONE]" {
			break
		}
		var chunk struct {
			Choices []struct {
				Delta struct {
					Content string `json:"content"`
				} `json:"delta"`
			} `json:"choices"`
		}
		if err := json.Unmarshal([]byte(data), &chunk); err != nil {
			continue
		}
		if len(chunk.Choices) > 0 && chunk.Choices[0].Delta.Content != "" {
			onText(chunk.Choices[0].Delta.Content)
		}
	}
	if err := scanner.Err(); err != nil && ctx.Err() == nil {
		log.Printf("⚠️  AI stream error: %v", err)
		return err
	}
	return nil
}
