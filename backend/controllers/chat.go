package controllers

import (
	"encoding/json"
	"log"
	"net/http"
	"net/url"
	"strings"
	"unicode"

	"rams-backend/models"

	"github.com/gin-gonic/gin"
)

type ChatRequest struct {
	Message string `json:"message"`
	Locale  string `json:"locale"`
}

type ChatRedirect struct {
	Type    string `json:"type"`
	Label   string `json:"label"`
	URL     string `json:"url"`
	Message string `json:"message"`
}

// chatTokenSets groups exact words by intent. Detection is deliberately
// conservative: price questions are routed to WhatsApp, everything else gets a
// short informational answer so the bot never pretends to know something it
// cannot verify.
var chatTokenSets = map[string]map[string]bool{
	"price": toSet(
		"harga", "harganya", "berapakah", "berapa", "biaya", "biayanya", "tarif",
		"budget", "anggaran", "mahal", "murah", "price", "prices", "pricing",
		"cost", "costs", "quote", "quotes", "quotation", "fee", "fees", "bayar",
		"pembayaran", "payment", "payments", "tagihan", "pricelist", "penawaran",
		"paket", "estimasi",
	),
	"services": toSet(
		"solusi", "solusinya", "produk", "layanan", "layanannya", "jasa", "erp",
		"pos", "ticketing", "tiket", "logistik", "software", "aplikasi",
		"custom", "kustom", "service", "services", "product", "products",
		"solution", "solutions", "fitur", "modul", "demo",
	),
	"contact": toSet(
		"kontak", "alamat", "lokasi", "hubungi", "menghubungi", "email",
		"telepon", "telp", "phone", "whatsapp", "wa", "call", "contact",
		"address", "location", "jam", "office", "cs",
	),
	"company": toSet(
		"tentang", "siapa", "perusahaan", "sejarah", "about", "who", "company",
		"career", "careers", "karir", "lowongan", "jobs", "job", "magang",
		"intern", "internship", "team", "tim",
	),
	"thanks": toSet("makasih", "thanks", "thank", "thx", "terimakasih", "mksh", "tq"),
	"greeting": toSet(
		"halo", "hai", "hi", "hello", "assalamualaikum", "salam", "morning",
		"afternoon", "evening", "malam", "siang", "sore", "pagi", "permisi", "hey",
	),
}

func toSet(words ...string) map[string]bool {
	set := map[string]bool{}
	for _, word := range words {
		set[word] = true
	}
	return set
}

// detectChatIntent classifies a free-text message. Multi-word phrases are
// matched first, then token overlap. Price wins over every other intent because
// routing a pricing question to WhatsApp is the whole point of this bot.
func detectChatIntent(message string) string {
	lower := strings.ToLower(message)
	tokens := tokenSet(lower)
	has := func(phrase string) bool { return strings.Contains(lower, phrase) }

	if has("harga berapa") || has("berapa harga") || has("price list") ||
		has("list harga") || has("estimasi biaya") {
		return "price"
	}
	if setsOverlap(tokens, chatTokenSets["price"]) {
		return "price"
	}
	if setsOverlap(tokens, chatTokenSets["services"]) {
		return "services"
	}
	if has("terima kasih") || has("terimakasih") {
		return "thanks"
	}
	if setsOverlap(tokens, chatTokenSets["contact"]) {
		return "contact"
	}
	if setsOverlap(tokens, chatTokenSets["company"]) {
		return "company"
	}
	if setsOverlap(tokens, chatTokenSets["thanks"]) {
		return "thanks"
	}
	if has("good morning") || has("good afternoon") || has("good evening") ||
		has("selamat pagi") || has("selamat siang") || has("selamat sore") || has("selamat malam") {
		return "greeting"
	}
	if setsOverlap(tokens, chatTokenSets["greeting"]) {
		return "greeting"
	}
	return "fallback"
}

func tokenSet(s string) map[string]bool {
	set := map[string]bool{}
	for _, token := range strings.FieldsFunc(s, func(r rune) bool {
		return !unicode.IsLetter(r) && r != '\''
	}) {
		if token != "" {
			set[token] = true
		}
	}
	return set
}

func setsOverlap(a, b map[string]bool) bool {
	for token := range a {
		if b[token] {
			return true
		}
	}
	return false
}

func chatLocale(locale, id, en string) string {
	if locale == "en" {
		return en
	}
	return id
}

func chatReply(intent, locale string) string {
	switch intent {
	case "price":
		return chatLocale(locale,
			"Terima kasih sudah bertanya! Kami tidak mencantumkan harga umum karena setiap kebutuhan berbeda-beda. Untuk mendapatkan penawaran yang akurat sesuai kebutuhan Anda, silakan lanjutkan ke WhatsApp kami — tim RAMS akan merespons dengan cepat.",
			"Thanks for asking! We don't publish a general price list because every need is different. For an accurate quote tailored to your needs, please continue to our WhatsApp — the RAMS team will respond quickly.",
		)
	case "services":
		return chatLocale(locale,
			"RAMS menyediakan 5 lini solusi: ERP Enterprise, POS Offline-First, Ticketing & Event, Logistik & Gudang, dan Perangkat Lunak Kustom. Anda bisa melihat detail lengkapnya di halaman Solusi. Ada yang ingin Anda tanyakan lebih lanjut?",
			"RAMS offers 5 solution lines: Enterprise ERP, Offline-First POS, Ticketing & Event, Logistics & Warehouse, and Custom Software. You can see the full details on our Solutions page. Anything else you'd like to know?",
		)
	case "contact":
		return chatLocale(locale,
			"Kami bisa dihubungi melalui WhatsApp, email, atau telepon — informasi kontak lengkap tersedia di halaman Kontak. Ada lagi yang bisa kami bantu?",
			"You can reach us via WhatsApp, email, or phone — full contact details are on our Contact page. Anything else we can help with?",
		)
	case "company":
		return chatLocale(locale,
			"PT Ragam Manfaat Sinergi (RAMS) adalah perusahaan pengembang perangkat lunak untuk bisnis Indonesia — fokus pada ERP, POS, ticketing, logistik, dan aplikasi kustom. Silakan lihat halaman Solusi untuk detail layanannya.",
			"PT Ragam Manfaat Sinergi (RAMS) is a software company for Indonesian businesses — focused on ERP, POS, ticketing, logistics, and custom applications. Please see our Solutions page for details.",
		)
	case "thanks":
		return chatLocale(locale,
			"Sama-sama! Kalau ada pertanyaan lain, jangan ragu untuk bertanya lagi ya.",
			"You're welcome! If you have any other questions, feel free to ask.",
		)
	case "greeting":
		return chatLocale(locale,
			"Halo! Selamat datang di RAMS. Ada yang bisa kami bantu? Anda bisa bertanya tentang solusi, harga, atau cara menghubungi kami.",
			"Hello! Welcome to RAMS. How can we help? You can ask about our solutions, pricing, or how to reach us.",
		)
	default:
		return chatLocale(locale,
			"Maaf, saya belum sepenuhnya memahami pertanyaan Anda. Anda bisa bertanya tentang solusi, harga layanan, atau cara menghubungi kami.",
			"Sorry, I didn't quite understand that. You can ask about our solutions, service pricing, or how to reach us.",
		)
	}
}

// buildWaURL builds a wa.me deep link with a prefilled message. Returns an
// empty string when the phone has no digits.
func buildWaURL(phone, message string) string {
	clean := strings.Map(func(r rune) rune {
		if r >= '0' && r <= '9' {
			return r
		}
		return -1
	}, phone)
	if clean == "" {
		return ""
	}
	return "https://wa.me/" + clean + "?text=" + url.QueryEscape(message)
}

// chatRedirect builds the WhatsApp handoff for price questions. The widget
// renders it as a prominent button under the bot's reply.
func (h *Handler) chatRedirect(intent, locale string) *ChatRedirect {
	if intent != "price" {
		return nil
	}
	var setting models.SiteSetting
	if err := h.DB.Where("key = ?", "whatsapp").First(&setting).Error; err != nil {
		return nil
	}
	waMessage := chatLocale(locale,
		"Halo tim RAMS! Saya tertarik dengan layanan RAMS dan ingin menanyakan harga. Mohon infonya.",
		"Hello RAMS team! I'm interested in your services and would like to ask about pricing. Please provide the details.",
	)
	waURL := buildWaURL(setting.ValueID, waMessage)
	if waURL == "" {
		return nil
	}
	return &ChatRedirect{
		Type:    "whatsapp",
		Label:   chatLocale(locale, "Chat via WhatsApp", "Chat on WhatsApp"),
		URL:     waURL,
		Message: waMessage,
	}
}

// ChatBot answers a free-text customer message and streams the reply as
// newline-delimited JSON so the frontend can render a natural typing effect.
//
// Events:
//
//	{"type":"meta","intent":...,"redirect":{...}}
//	{"type":"delta","text":"..."}   (zero or more)
//	{"type":"done"}
//
// When an AI provider is configured the reply text is generated by the model
// (grounded in the site settings so it never invents prices or facts); without
// a key it falls back to the keyword bot. Price questions always carry a
// WhatsApp redirect regardless of which engine wrote the text.
func (h *Handler) ChatBot(c *gin.Context) {
	var req ChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		badRequest(c, err)
		return
	}

	message := strings.TrimSpace(req.Message)
	if message == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Pesan tidak boleh kosong"})
		return
	}

	locale := models.NormalizeLocale(req.Locale)
	intent := detectChatIntent(message)
	redirect := h.chatRedirect(intent, locale)

	c.Writer.Header().Set("Content-Type", "application/x-ndjson")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("X-Accel-Buffering", "no")

	writeEvent := func(payload map[string]any) {
		data, err := json.Marshal(payload)
		if err != nil {
			return
		}
		data = append(data, '\n')
		if _, err := c.Writer.Write(data); err != nil {
			return
		}
		c.Writer.Flush()
	}

	writeEvent(map[string]any{"type": "meta", "intent": intent, "redirect": redirect})

	if h.aiEnabled() {
		settings := h.aiSettings()
		systemPrompt := aiSystemPrompt(locale, settings)
		err := h.streamAI(c.Request.Context(), systemPrompt, message, func(delta string) {
			writeEvent(map[string]any{"type": "delta", "text": delta})
		})
		if err == nil {
			writeEvent(map[string]any{"type": "done"})
			return
		}
		if c.Request.Context().Err() != nil {
			// Client disconnected mid-stream; nothing more to send.
			return
		}
		log.Printf("⚠️  Chat AI gagal, fallback ke bot kata kunci: %v", err)
	}

	writeEvent(map[string]any{"type": "delta", "text": chatReply(intent, locale)})
	writeEvent(map[string]any{"type": "done"})
}
