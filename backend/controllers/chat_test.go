package controllers

import "testing"

func TestDetectChatIntent(t *testing.T) {
	cases := []struct {
		msg  string
		want string
	}{
		{"berapa harga ERP?", "price"},
		{"harga paket", "price"},
		{"what is the price?", "price"},
		{"berapa biaya implementasinya", "price"},
		{"I'd like a quote please", "price"},
		{"harga berapa ya", "price"},
		{"halo", "greeting"},
		{"good morning", "greeting"},
		{"selamat siang", "greeting"},
		{"terima kasih banyak", "thanks"},
		{"thanks!", "thanks"},
		{"layanan apa saja?", "services"},
		{"pos offline pertama", "services"},
		{"solusi apa yang tersedia", "services"},
		{"alamat kantor", "contact"},
		{"how can I contact you", "contact"},
		{"tentang perusahaan", "company"},
		{"who are you", "company"},
		{"zxqblorp nonsense words", "fallback"},
	}

	for _, tc := range cases {
		if got := detectChatIntent(tc.msg); got != tc.want {
			t.Errorf("detectChatIntent(%q) = %q, want %q", tc.msg, got, tc.want)
		}
	}
}

func TestChatReplyNeverEmpty(t *testing.T) {
	for _, intent := range []string{"price", "services", "contact", "company", "thanks", "greeting", "fallback"} {
		for _, locale := range []string{"id", "en"} {
			if reply := chatReply(intent, locale); reply == "" {
				t.Errorf("chatReply(%q, %q) returned empty reply", intent, locale)
			}
		}
	}
}

func TestBuildWaURL(t *testing.T) {
	cases := []struct {
		phone, message, want string
	}{
		{"6281200000000", "Halo", "https://wa.me/6281200000000?text=Halo"},
		{"+62 812 0000 0000", "Halo dunia", "https://wa.me/6281200000000?text=Halo+dunia"},
		{"", "Halo", ""},
		{"abc", "Halo", ""},
	}

	for _, tc := range cases {
		if got := buildWaURL(tc.phone, tc.message); got != tc.want {
			t.Errorf("buildWaURL(%q, %q) = %q, want %q", tc.phone, tc.message, got, tc.want)
		}
	}
}

func TestChatLocale(t *testing.T) {
	if got := chatLocale("en", "ID", "EN"); got != "EN" {
		t.Errorf("chatLocale(en) = %q, want EN", got)
	}
	if got := chatLocale("id", "ID", "EN"); got != "ID" {
		t.Errorf("chatLocale(id) = %q, want ID", got)
	}
	if got := chatLocale("fr", "ID", "EN"); got != "ID" {
		t.Errorf("chatLocale(fr) should fall back to ID, got %q", got)
	}
}
