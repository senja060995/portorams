package controllers

import (
	"strings"
	"testing"
)

func TestAISystemPromptNeverSoundsLikeAI(t *testing.T) {
	settings := map[string]string{
		"company_name": "PT Ragam Manfaat Sinergi (RAMS)",
		"whatsapp":     "6281200000000",
		"email":        "halo@rams.biz.id",
		"phone":        "+62 21 1234 5678",
	}

	for _, locale := range []string{"id", "en"} {
		prompt := aiSystemPrompt(locale, settings)
		if prompt == "" {
			t.Fatalf("aiSystemPrompt(%q) returned empty prompt", locale)
		}
		for _, forbidden := range []string{
			"as an AI", "I'm an AI", "I am an AI", "you are an AI",
			"saya adalah AI", "aku adalah AI", "saya asisten virtual",
			"saya adalah asisten virtual", "language model",
		} {
			if strings.Contains(prompt, forbidden) {
				t.Errorf("aiSystemPrompt(%q) sounds like %q — must stay human", locale, forbidden)
			}
		}
		if !strings.Contains(prompt, "WhatsApp") {
			t.Errorf("aiSystemPrompt(%q) missing WhatsApp contact", locale)
		}
		if !strings.Contains(strings.ToLower(prompt), "harga") && !strings.Contains(strings.ToLower(prompt), "price") {
			t.Errorf("aiSystemPrompt(%q) missing the pricing rule", locale)
		}
	}
}

func TestAISystemPromptFallsBackCompanyName(t *testing.T) {
	prompt := aiSystemPrompt("id", map[string]string{})
	if !strings.Contains(prompt, "PT Ragam Manfaat Sinergi") {
		t.Errorf("aiSystemPrompt() should fall back to the default company name")
	}
}

func TestHandlerAIEnabled(t *testing.T) {
	cases := []struct {
		name    string
		baseURL string
		key     string
		model   string
		want    bool
	}{
		{"configured", "https://api.groq.com/openai/v1", "sk-123", "llama-3.3-70b-versatile", true},
		{"no key", "https://api.groq.com/openai/v1", "", "llama-3.3-70b-versatile", false},
		{"no model", "https://api.groq.com/openai/v1", "sk-123", "", false},
	}

	for _, tc := range cases {
		h := &Handler{AIBaseURL: tc.baseURL, AIAPIKey: tc.key, AIModel: tc.model}
		if got := h.aiEnabled(); got != tc.want {
			t.Errorf("%s: aiEnabled() = %v, want %v", tc.name, got, tc.want)
		}
	}
}
