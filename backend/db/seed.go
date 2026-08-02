package db

import (
	"crypto/rand"
	"log"
	"os"
	"strings"
	"time"

	"rams-backend/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// placeholder image helpers. Replace via the CMS once real brand assets exist.
const (
	imgHero        = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=2400&q=80"
	imgCtaBanner   = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=2400&q=80"
	imgNewsBg      = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=2400&q=80"
	imgContactHero = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=2400&q=80"
	imgSolutionCta = "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=2400&q=80"
	imgSolutionBg  = "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=2400&q=80"
)

// SeedDatabase fills empty tables with the initial RAMS content set in both
// locales. Every block is guarded by a count check so it is safe to run on
// every boot and never overwrites content edited through the CMS.
func SeedDatabase(database *gorm.DB) {
	seedWalletAdmin(database)
	seedSettings(database)
	seedSections(database)
	seedValueProps(database)
	seedPartners(database)
	seedSolutions(database)
	seedProducts(database)
	seedArticleCategories(database)
	seedArticles(database)
	seedApproachSteps(database)
	seedLegalPages(database)
}

// seedWalletAdmin bootstraps the wallet allowlist from ALLOWED_WALLETS and
// ties each address to a CMS account. The first address becomes an admin; the
// rest become editors unless the entry carries an explicit ":role" suffix.
//
// Unlike the old password-based seeding this deliberately never resets any
// password on boot, and the provisioned accounts carry an unusable random
// password — the only way in is a registered wallet signature.
func seedWalletAdmin(database *gorm.DB) {
	raw := strings.TrimSpace(os.Getenv("ALLOWED_WALLETS"))
	if raw == "" {
		log.Println("⚠️  ALLOWED_WALLETS kosong — tidak ada wallet yang dapat masuk CMS. Isi .env lalu restart.")
		return
	}

	first := true
	for _, entry := range strings.Split(raw, ",") {
		entry = strings.TrimSpace(entry)
		if entry == "" {
			continue
		}
		parts := strings.SplitN(entry, ":", 2)
		addr := strings.TrimSpace(parts[0])
		role := "editor"
		if first {
			role = "admin"
		}
		if len(parts) == 2 {
			if r := strings.TrimSpace(parts[1]); r == "admin" || r == "editor" {
				role = r
			}
		}
		first = false

		if !isValidAddress(addr) {
			log.Printf("⚠️  ALLOWED_WALLETS berisi alamat tidak valid, dilewati: %q", addr)
			continue
		}
		address := strings.ToLower(addr)

		upsertAllowedWallet(database, address, role)
	}
}

func upsertAllowedWallet(database *gorm.DB, address, role string) {
	var wallet models.AllowedWallet
	if err := database.Where("address = ?", address).First(&wallet).Error; err == nil {
		if wallet.Role != role {
			database.Model(&wallet).Update("role", role)
		}
	} else {
		database.Create(&models.AllowedWallet{
			Address: address,
			Label:   "Seeded dari ALLOWED_WALLETS",
			Role:    role,
			Active:  true,
		})
	}

	var user models.User
	if err := database.Where("wallet_address = ?", address).First(&user).Error; err != nil {
		username := "wallet-" + address[2:10]
		hashed, err := bcrypt.GenerateFromPassword(randomBytes(32), bcrypt.DefaultCost)
		if err != nil {
			log.Printf("❌ Gagal membuat akun wallet %s: %v", address, err)
			return
		}
		database.Create(&models.User{
			Username:      username,
			Email:         username + "@wallet.local",
			Password:      string(hashed),
			Role:          role,
			WalletAddress: address,
		})
		log.Printf("✅ Wallet admin di-seed: %s (role: %s)", address, role)
	} else if user.Role != role {
		database.Model(&user).Update("role", role)
	}
}

// isValidAddress performs a light structural check (0x + 40 hex). Full EIP-55
// checksum validation happens at sign-in and in the CMS allowlist editor.
func isValidAddress(addr string) bool {
	if len(addr) != 42 || !strings.HasPrefix(addr, "0x") {
		return false
	}
	for _, r := range addr[2:] {
		if !((r >= '0' && r <= '9') || (r >= 'a' && r <= 'f') || (r >= 'A' && r <= 'F')) {
			return false
		}
	}
	return true
}

func randomBytes(n int) []byte {
	buf := make([]byte, n)
	if _, err := rand.Read(buf); err != nil {
		panic(err)
	}
	return buf
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func seedSettings(database *gorm.DB) {
	var count int64
	database.Model(&models.SiteSetting{}).Count(&count)
	if count > 0 {
		return
	}

	settings := []models.SiteSetting{
		{Key: "company_name", ValueID: "PT Ragam Manfaat Sinergi", ValueEN: "PT Ragam Manfaat Sinergi"},
		{Key: "company_short", ValueID: "RAMS", ValueEN: "RAMS"},
		{Key: "tagline", ValueID: "Perangkat Lunak Presisi untuk Bisnis Indonesia", ValueEN: "Precision Software for Indonesian Business"},
		{Key: "email", ValueID: "hello@rams.biz.id", ValueEN: "hello@rams.biz.id"},
		{Key: "phone", ValueID: "+62 823 2598 0067", ValueEN: "+62 823 2598 0067"},
		{Key: "whatsapp", ValueID: "6282325980067", ValueEN: "6282325980067"},
		{Key: "address", ValueID: "Sidomulyo, Kabupaten Semarang, Jawa Tengah, Indonesia", ValueEN: "Sidomulyo, Semarang Regency, Central Java, Indonesia"},
		{Key: "linkedin", ValueID: "https://www.linkedin.com/company/rams-id", ValueEN: "https://www.linkedin.com/company/rams-id"},
		{Key: "instagram", ValueID: "https://www.instagram.com/rams.id", ValueEN: "https://www.instagram.com/rams.id"},
		{Key: "footer_note", ValueID: "Membangun sistem yang dipakai, bukan sekadar dikirim.", ValueEN: "Building systems that get used, not just delivered."},
		{Key: "copyright", ValueID: "PT Ragam Manfaat Sinergi. Seluruh hak cipta dilindungi.", ValueEN: "PT Ragam Manfaat Sinergi. All rights reserved."},
	}
	for i := range settings {
		database.Create(&settings[i])
	}
	log.Println("✅ Site settings seeded")
}

func seedSections(database *gorm.DB) {
	var count int64
	database.Model(&models.PageSection{}).Count(&count)
	if count > 0 {
		return
	}

	sections := []models.PageSection{
		{
			Key:        "home_hero",
			TitleID:    "Sistem Digital Presisi\nuntuk Bisnis Indonesia",
			TitleEN:    "Precision Digital Systems\nfor Indonesian Business",
			SubtitleID: "RAMS merancang ERP, POS, dan perangkat lunak kustom yang benar-benar dipakai di lapangan — dibangun dari masalah nyata, bukan dari brosur.",
			SubtitleEN: "RAMS builds ERP, POS, and custom software that actually gets used on the ground — designed from real operational problems, not from brochures.",
			CtaLabelID: "Jelajahi Solusi Kami",
			CtaLabelEN: "Explore Our Solutions",
			CtaHref:    "/solutions/erp-enterprise",
			ImageURL:   imgHero,
		},
		{
			Key:       "home_partners",
			TitleID:   "Klien & Mitra Terpercaya",
			TitleEN:   "Trusted Clients & Partners",
			UpdatedAt: time.Now(),
		},
		{
			Key:        "home_value",
			TitleID:    "Mitra Teknologi yang Mengerti Operasional Anda",
			TitleEN:    "A Technology Partner That Understands Your Operations",
			SubtitleID: "RAMS membangun sistem dari pengalaman menjalankan bisnis sendiri — retail, percetakan, ticketing, dan logistik. Kami tahu di mana sistem biasanya gagal.",
			SubtitleEN: "RAMS builds systems from the experience of running its own businesses — retail, printing, ticketing, and logistics. We know where systems usually break.",
			ImageURL:   imgSolutionBg,
		},
		{
			Key:        "home_solutions",
			TitleID:    "Solusi yang Menggerakkan Bisnis Anda",
			TitleEN:    "Solutions That Move You Forward",
			SubtitleID: "Dari otomasi operasional sampai visibilitas data real-time, setiap solusi RAMS dirancang menyesuaikan alur kerja Anda — bukan sebaliknya.",
			SubtitleEN: "From operational automation to real-time data visibility, every RAMS solution adapts to your workflow — not the other way around.",
		},
		{
			Key:        "home_news",
			TitleID:    "Berita &\nPembaruan",
			TitleEN:    "News &\nUpdates",
			SubtitleID: "Ikuti perkembangan terbaru RAMS: rilis produk, studi kasus implementasi, dan catatan teknis dari lapangan.",
			SubtitleEN: "Follow the latest from RAMS: product releases, implementation case studies, and technical notes from the field.",
			CtaLabelID: "Lihat Semua Artikel",
			CtaLabelEN: "View All Articles",
			CtaHref:    "/news-updates",
			ImageURL:   imgNewsBg,
		},
		{
			Key:        "home_cta",
			TitleID:    "Percepat Transformasi\nDigital Anda",
			TitleEN:    "Accelerate Your\nDigital Transformation",
			CtaLabelID: "Hubungi Kami",
			CtaLabelEN: "Contact Us",
			CtaHref:    "/contact",
			ImageURL:   imgCtaBanner,
		},
		{
			Key:        "solutions_index",
			EyebrowID:  "Solusi",
			EyebrowEN:  "Solutions",
			TitleID:    "Satu Rekanan, Seluruh Rantai Operasional",
			TitleEN:    "One Partner, Your Entire Operational Chain",
			SubtitleID: "Lima lini solusi yang saling terhubung — mulai dari kasir di outlet sampai konsolidasi keuangan multi-perusahaan.",
			SubtitleEN: "Five interconnected solution lines — from the cashier at your outlet to multi-company financial consolidation.",
			ImageURL:   imgSolutionBg,
		},
		{
			Key:        "news_index",
			TitleID:    "Berita &\nPembaruan",
			TitleEN:    "News &\nUpdates",
			SubtitleID: "Catatan teknis, studi kasus, dan pembaruan produk dari tim RAMS.",
			SubtitleEN: "Technical notes, case studies, and product updates from the RAMS team.",
		},
		{
			Key:        "contact_approach",
			TitleID:    "Cara Kami Bekerja",
			TitleEN:    "Our Approach",
			SubtitleID: "Kami menggabungkan pemahaman bisnis, desain solusi, dan optimasi berkelanjutan agar sistem yang dibangun benar-benar terpakai dan berdampak.",
			SubtitleEN: "We combine business understanding, solution design, and continuous optimization so the systems we build are genuinely used and genuinely impactful.",
			ImageURL:   imgContactHero,
		},
		{
			Key:        "contact_form",
			TitleID:    "Siap Mulai?\nMari Bicara.",
			TitleEN:    "Ready to Start?\nLet's Talk.",
			SubtitleID: "Ceritakan kendala operasional Anda. Kami balas dengan rekomendasi teknis, bukan penawaran generik.",
			SubtitleEN: "Tell us your operational bottleneck. We reply with technical recommendations, not a generic quote.",
		},
	}
	for i := range sections {
		sections[i].UpdatedAt = time.Now()
		database.Create(&sections[i])
	}
	log.Println("✅ Page sections seeded")
}

func seedValueProps(database *gorm.DB) {
	var count int64
	database.Model(&models.ValueProp{}).Count(&count)
	if count > 0 {
		return
	}

	items := []models.ValueProp{
		{
			TitleID: "Pengalaman\nLapangan",
			TitleEN: "Field-Tested\nExperience",
			DescID:  "Kami pernah menjalankan retail, percetakan, dan ticketing sendiri. Sistem kami dirancang dari kendala yang benar-benar pernah kami alami.",
			DescEN:  "We have run retail, printing, and ticketing operations ourselves. Our systems are designed around constraints we have actually lived through.",
			Order:   1,
		},
		{
			TitleID: "Kustomisasi\nPenuh",
			TitleEN: "Full\nCustomization",
			DescID:  "Tidak ada paket kaku. Kami menyesuaikan sistem dengan alur kerja tim Anda, termasuk kebiasaan operasional yang sudah berjalan.",
			DescEN:  "No rigid packages. We fit the system to your team's workflow, including the operational habits already in place.",
			Order:   2,
		},
		{
			TitleID: "Pendampingan\nJangka Panjang",
			TitleEN: "End-to-End\nSupport",
			DescID:  "Dari perancangan, implementasi, pelatihan tim, sampai optimasi setelah go-live. Kami rekan jangka panjang, bukan vendor sekali kirim.",
			DescEN:  "From design and implementation to team training and post-go-live optimization. We are a long-term partner, not a one-off vendor.",
			Order:   3,
		},
	}
	for i := range items {
		database.Create(&items[i])
	}
	log.Println("✅ Value props seeded")
}

func seedPartners(database *gorm.DB) {
	var count int64
	database.Model(&models.Partner{}).Count(&count)
	if count > 0 {
		return
	}

	names := []string{
		"Sidomulyo Advertising",
		"Santri Online",
		"Distro Kang Santri",
		"TixNova",
		"Kang Santri Agri",
		"RAMS Tech",
	}
	for i, name := range names {
		database.Create(&models.Partner{
			Name:    name,
			LogoURL: "",
			Order:   i + 1,
			Active:  true,
		})
	}
	log.Println("✅ Partners seeded (logos empty — upload via CMS)")
}

func seedSolutions(database *gorm.DB) {
	var count int64
	database.Model(&models.Solution{}).Count(&count)
	if count > 0 {
		return
	}

	solutions := []models.Solution{
		{
			Slug:      "erp-enterprise",
			NameID:    "ERP Enterprise",
			NameEN:    "Enterprise ERP",
			EyebrowID: "Solusi untuk",
			EyebrowEN: "Solution for",
			TitleID:   "Satu sistem untuk produksi, stok, dan keuangan yang benar-benar sinkron",
			TitleEN:   "One system where production, inventory, and finance are genuinely in sync",
			DescID:    "ERP modular RAMS menyatukan perhitungan HPP, work order, stok bahan baku, dan laporan keuangan dalam satu alur. Dirancang untuk manufaktur, percetakan, dan bisnis multi-perusahaan.",
			DescEN:    "RAMS modular ERP unifies cost-of-goods calculation, work orders, raw material inventory, and financial reporting in a single flow. Built for manufacturing, printing, and multi-company groups.",
			SummaryID: "Menyatukan produksi, gudang, dan keuangan dalam satu sumber kebenaran. Laporan yang dulu butuh lima hari kini selesai dalam hitungan detik.",
			SummaryEN: "Unifies production, warehouse, and finance into a single source of truth. Reports that used to take five days now finish in seconds.",

			FeatureTitleID:    "Menyatukan produksi, persediaan, dan keuangan dalam satu alur kerja",
			FeatureTitleEN:    "Bringing production, inventory, and finance into one workflow",
			CapabilityTitleID: "Sistem ERP yang dirancang mengikuti proses bisnis Anda, bukan memaksa Anda berubah",
			CapabilityTitleEN: "An ERP designed around your business process, not one that forces you to change",
			CapabilityImage:   imgSolutionBg,

			CtaLabelID: "Mulai Diskusi Teknis",
			CtaLabelEN: "Start a Technical Discussion",
			CtaHref:    "/contact",
			CtaTitleID: "Setiap bisnis punya alur produksi berbeda.\nERP Anda harus mencerminkan itu.",
			CtaTitleEN: "Every business runs production differently.\nYour ERP should reflect that.",
			CtaBanner:  imgSolutionCta,

			Order:     1,
			Published: true,
			Features: []models.SolutionFeature{
				{
					LabelID: "Kalkulasi HPP", LabelEN: "Cost Engine",
					TitleID: "Harga pokok produksi terhitung otomatis",
					TitleEN: "Cost of goods calculated automatically",
					DescID:  "Setiap pemakaian bahan, jam kerja mesin, dan biaya overhead langsung masuk ke perhitungan HPP per work order — tanpa spreadsheet terpisah.",
					DescEN:  "Every material draw, machine hour, and overhead cost flows straight into per-work-order costing — with no separate spreadsheet.",
					Order:   1,
				},
				{
					LabelID: "Work Order", LabelEN: "Work Order",
					TitleID: "Papan kerja produksi yang selalu terbaru",
					TitleEN: "A production board that is always current",
					DescID:  "Status setiap pekerjaan terlihat real-time dari penerimaan order sampai serah terima, lengkap dengan penanggung jawab dan tenggat.",
					DescEN:  "Every job's status is visible in real time from order intake to handover, complete with owner and deadline.",
					Order:   2,
				},
				{
					LabelID: "Multi-Perusahaan", LabelEN: "Multi-Company",
					TitleID: "Konsolidasi beberapa badan usaha sekaligus",
					TitleEN: "Consolidate several legal entities at once",
					DescID:  "Data tiap perusahaan terpisah rapi namun bisa dikonsolidasikan menjadi satu laporan grup, termasuk transaksi antar-perusahaan.",
					DescEN:  "Each entity's data stays cleanly separated yet consolidates into one group report, including inter-company transactions.",
					Order:   3,
				},
				{
					LabelID: "Kepatuhan Pajak", LabelEN: "Tax Compliance",
					TitleID: "Faktur dan pelaporan pajak yang siap audit",
					TitleEN: "Invoicing and tax reporting that is audit-ready",
					DescID:  "Penomoran faktur, PPN, dan jejak audit tersusun otomatis sehingga penutupan buku bulanan tidak lagi jadi pekerjaan lembur.",
					DescEN:  "Invoice numbering, VAT, and audit trails are assembled automatically so monthly closing is no longer overtime work.",
					Order:   4,
				},
			},
			UseCases: []models.SolutionUseCase{
				{TitleID: "Otomasi Percetakan & Manufaktur", TitleEN: "Printing & Manufacturing Automation", DescID: "Menghitung kebutuhan bahan, waste, dan margin tiap pesanan cetak secara otomatis sebelum produksi dimulai.", DescEN: "Automatically computes material needs, waste, and margin for each print order before production starts.", Order: 1},
				{TitleID: "Konsolidasi Keuangan Grup", TitleEN: "Group Financial Consolidation", DescID: "Menggabungkan laporan beberapa badan usaha menjadi satu neraca grup tanpa rekonsiliasi manual.", DescEN: "Merges reports from multiple entities into one group balance sheet without manual reconciliation.", Order: 2},
				{TitleID: "Kendali Persediaan Bahan Baku", TitleEN: "Raw Material Inventory Control", DescID: "Stok bahan berkurang otomatis mengikuti realisasi produksi, dengan peringatan titik pesan ulang.", DescEN: "Material stock decrements automatically against actual production, with reorder-point alerts.", Order: 3},
				{TitleID: "Visibilitas Margin per Proyek", TitleEN: "Per-Project Margin Visibility", DescID: "Manajemen melihat proyek mana yang benar-benar menguntungkan, bukan hanya yang bernilai besar.", DescEN: "Management sees which projects are actually profitable, not merely which are large.", Order: 4},
			},
		},
		{
			Slug:      "pos-retail",
			NameID:    "POS Offline-First",
			NameEN:    "Offline-First POS",
			EyebrowID: "Solusi untuk",
			EyebrowEN: "Solution for",
			TitleID:   "Kasir yang tetap jalan walau internet mati",
			TitleEN:   "A cashier that keeps working when the internet does not",
			DescID:    "Sistem POS RAMS menyimpan transaksi di perangkat lebih dulu, lalu menyinkronkan ke pusat saat koneksi kembali. Antrean tidak pernah berhenti karena jaringan.",
			DescEN:    "RAMS POS writes transactions to the device first, then syncs to the central system when connectivity returns. The queue never stops because of the network.",
			SummaryID: "Transaksi tetap berjalan tanpa koneksi, sinkron otomatis saat online, dan stok multi-outlet tetap akurat.",
			SummaryEN: "Transactions continue offline, sync automatically when back online, and multi-outlet stock stays accurate.",

			FeatureTitleID:    "Dirancang untuk kondisi jaringan Indonesia yang sesungguhnya",
			FeatureTitleEN:    "Designed for how Indonesian networks actually behave",
			CapabilityTitleID: "Operasional outlet yang tidak bergantung pada kualitas koneksi",
			CapabilityTitleEN: "Outlet operations that do not depend on connection quality",
			CapabilityImage:   imgSolutionBg,

			CtaLabelID: "Konsultasi Kebutuhan Outlet",
			CtaLabelEN: "Discuss Your Outlet Needs",
			CtaHref:    "/contact",
			CtaTitleID: "Antrean kasir tidak boleh berhenti\nkarena sinyal.",
			CtaTitleEN: "A checkout queue should never stop\nbecause of signal.",
			CtaBanner:  imgSolutionCta,

			Order:     2,
			Published: true,
			Features: []models.SolutionFeature{
				{
					LabelID: "Mode Luring", LabelEN: "Offline Mode",
					TitleID: "Transaksi tersimpan lokal lebih dulu",
					TitleEN: "Transactions are written locally first",
					DescID:  "Basis data lokal di perangkat menampung transaksi selama jaringan terputus, tanpa kehilangan satu struk pun.",
					DescEN:  "An on-device local database buffers transactions while the network is down, without losing a single receipt.",
					Order:   1,
				},
				{
					LabelID: "Sinkronisasi", LabelEN: "Sync Engine",
					TitleID: "Penyelarasan otomatis dengan penanganan konflik",
					TitleEN: "Automatic sync with conflict handling",
					DescID:  "Saat koneksi pulih, data terkirim bertahap dengan mekanisme ulang-coba sehingga pusat tidak kebanjiran permintaan.",
					DescEN:  "When connectivity returns, data is pushed incrementally with retry backoff so the central system is not flooded.",
					Order:   2,
				},
				{
					LabelID: "Multi-Outlet", LabelEN: "Multi-Outlet",
					TitleID: "Stok dan harga terkendali dari pusat",
					TitleEN: "Central control of stock and pricing",
					DescID:  "Perubahan harga dan promo dikirim dari pusat ke semua outlet, sementara stok tiap cabang tetap terpantau terpisah.",
					DescEN:  "Price and promo changes are dispatched centrally to every outlet, while each branch's stock remains separately tracked.",
					Order:   3,
				},
				{
					LabelID: "Perangkat Keras", LabelEN: "Hardware",
					TitleID: "Terhubung dengan printer dan pemindai yang sudah Anda punya",
					TitleEN: "Works with the printer and scanner you already own",
					DescID:  "Dukungan pencetak struk Bluetooth dan pemindai barcode standar, sehingga tidak perlu belanja perangkat baru.",
					DescEN:  "Support for Bluetooth receipt printers and standard barcode scanners, so no new hardware purchase is required.",
					Order:   4,
				},
			},
			UseCases: []models.SolutionUseCase{
				{TitleID: "Jaringan Ritel Multi-Cabang", TitleEN: "Multi-Branch Retail Networks", DescID: "Menjalankan puluhan outlet dengan harga terpusat namun stok dan kas per cabang.", DescEN: "Runs dozens of outlets with centralized pricing but per-branch stock and cash.", Order: 1},
				{TitleID: "Waralaba Makanan & Minuman", TitleEN: "Food & Beverage Franchises", DescID: "Menstandarkan menu, resep, dan pemakaian bahan di seluruh gerai waralaba.", DescEN: "Standardizes menu, recipes, and material usage across all franchise outlets.", Order: 2},
				{TitleID: "Rekonsiliasi Kas Harian", TitleEN: "Daily Cash Reconciliation", DescID: "Menutup kas setiap shift dengan selisih yang terlacak, bukan ditebak.", DescEN: "Closes cash each shift with variances traced rather than guessed.", Order: 3},
				{TitleID: "Pemantauan Penjualan Real-Time", TitleEN: "Real-Time Sales Monitoring", DescID: "Pemilik melihat performa tiap outlet dari satu dasbor tanpa menunggu laporan manual.", DescEN: "Owners see each outlet's performance from one dashboard without waiting for manual reports.", Order: 4},
			},
		},
		{
			Slug:      "ticketing-event",
			NameID:    "Ticketing & Event",
			NameEN:    "Ticketing & Event",
			EyebrowID: "Solusi untuk",
			EyebrowEN: "Solution for",
			TitleID:   "Infrastruktur tiket yang tidak tumbang saat lonjakan pembelian",
			TitleEN:   "Ticketing infrastructure that holds up under a buying surge",
			DescID:    "Platform ticketing RAMS menggunakan ruang tunggu berbasis antrean dan validasi gerbang luring, dirancang untuk lonjakan trafik penjualan tiket konser dan event skala besar.",
			DescEN:    "The RAMS ticketing platform uses a queue-based waiting room and offline gate validation, engineered for the traffic spikes of concert and large-event ticket sales.",
			SummaryID: "Ruang tunggu berbasis antrean, QR terenkripsi, dan validasi gerbang yang tetap berfungsi tanpa jaringan.",
			SummaryEN: "Queue-based waiting room, encrypted QR codes, and gate validation that works without a network.",

			FeatureTitleID:    "Menangani lonjakan pembelian tanpa mengorbankan keadilan antrean",
			FeatureTitleEN:    "Handling purchase surges without sacrificing queue fairness",
			CapabilityTitleID: "Dari penjualan tiket sampai pemindaian di gerbang, dalam satu rangkaian",
			CapabilityTitleEN: "From ticket sale to gate scan, in one continuous chain",
			CapabilityImage:   imgSolutionBg,

			CtaLabelID: "Bicarakan Event Anda",
			CtaLabelEN: "Talk About Your Event",
			CtaHref:    "/contact",
			CtaTitleID: "Momen penjualan tiket hanya sekali.\nSistemnya harus siap.",
			CtaTitleEN: "A ticket on-sale happens once.\nThe system has to be ready.",
			CtaBanner:  imgSolutionCta,

			Order:     3,
			Published: true,
			Features: []models.SolutionFeature{
				{
					LabelID: "Ruang Tunggu", LabelEN: "Waiting Room",
					TitleID: "Antrean bertoken yang menahan lonjakan trafik",
					TitleEN: "A token queue that absorbs traffic spikes",
					DescID:  "Pembeli masuk melalui antrean bertoken sehingga basis data tidak menerima beban puncak secara langsung.",
					DescEN:  "Buyers enter through a token queue so the database never takes the peak load directly.",
					Order:   1,
				},
				{
					LabelID: "Validasi Tiket", LabelEN: "Ticket Validation",
					TitleID: "QR terenkripsi yang tidak bisa diduplikasi",
					TitleEN: "Encrypted QR codes that cannot be duplicated",
					DescID:  "Setiap tiket membawa tanda tangan digital dan hanya bisa dipakai satu kali, terverifikasi walau pemindai sedang luring.",
					DescEN:  "Each ticket carries a digital signature and is single-use, verifiable even while the scanner is offline.",
					Order:   2,
				},
				{
					LabelID: "Gerbang Masuk", LabelEN: "Gate Access",
					TitleID: "Pemindaian gerbang yang cepat dan tahan jaringan buruk",
					TitleEN: "Gate scanning that is fast and network-tolerant",
					DescID:  "Aplikasi pemindai bekerja luring dan menyelaraskan hasil validasi setelahnya, mencegah antrean menumpuk di pintu masuk.",
					DescEN:  "The scanner app works offline and syncs validation results afterwards, preventing queues from piling up at the entrance.",
					Order:   3,
				},
				{
					LabelID: "Dasbor Promotor", LabelEN: "Promoter Dashboard",
					TitleID: "Kendali inventaris tiket di tangan promotor",
					TitleEN: "Ticket inventory control in the promoter's hands",
					DescID:  "Promotor mengatur kategori tiket, kuota, dan harga sendiri, serta memantau penyerapan penjualan secara langsung.",
					DescEN:  "Promoters manage ticket tiers, quotas, and pricing themselves, and monitor sell-through live.",
					Order:   4,
				},
			},
			UseCases: []models.SolutionUseCase{
				{TitleID: "Penjualan Tiket Konser", TitleEN: "Concert Ticket On-Sales", DescID: "Menahan lonjakan pembelian serentak tanpa menurunkan layanan bagi pembeli yang sudah dalam antrean.", DescEN: "Absorbs simultaneous purchase surges without degrading service for buyers already in the queue.", Order: 1},
				{TitleID: "Akses Gerbang Stadion", TitleEN: "Stadium Gate Access", DescID: "Memvalidasi ribuan pengunjung per gerbang dengan waktu pindai di bawah satu detik.", DescEN: "Validates thousands of visitors per gate with sub-second scan time.", Order: 2},
				{TitleID: "Event Berbayar Berulang", TitleEN: "Recurring Paid Events", DescID: "Menggunakan ulang konfigurasi event dan kategori tiket untuk penyelenggaraan berikutnya.", DescEN: "Reuses event configuration and ticket tiers for the next occurrence.", Order: 3},
				{TitleID: "Rekonsiliasi Pembayaran", TitleEN: "Payment Reconciliation", DescID: "Menyandingkan transaksi gerbang pembayaran dengan tiket terbit secara otomatis.", DescEN: "Automatically matches payment gateway transactions against issued tickets.", Order: 4},
			},
		},
		{
			Slug:      "logistics-wms",
			NameID:    "Logistik & Gudang",
			NameEN:    "Logistics & Warehouse",
			EyebrowID: "Solusi untuk",
			EyebrowEN: "Solution for",
			TitleID:   "Armada dan gudang yang terlihat jelas dari satu layar",
			TitleEN:   "Fleet and warehouse visible from a single screen",
			DescID:    "Sistem logistik RAMS memantau posisi armada, mengoptimalkan rute, dan mencatat pergerakan barang di gudang dengan pemindaian barcode.",
			DescEN:    "RAMS logistics tracks fleet position, optimizes routes, and records warehouse goods movement through barcode scanning.",
			SummaryID: "Pelacakan armada, optimasi rute, dan pencatatan gudang berbasis pemindaian dalam satu sistem.",
			SummaryEN: "Fleet tracking, route optimization, and scan-based warehouse recording in one system.",

			FeatureTitleID:    "Menutup celah antara apa yang tercatat dan apa yang benar-benar terjadi",
			FeatureTitleEN:    "Closing the gap between what is recorded and what actually happens",
			CapabilityTitleID: "Kendali pengiriman dan persediaan tanpa menelepon satu per satu",
			CapabilityTitleEN: "Control over delivery and inventory without phoning around",
			CapabilityImage:   imgSolutionBg,

			CtaLabelID: "Diskusikan Operasional Anda",
			CtaLabelEN: "Discuss Your Operations",
			CtaHref:    "/contact",
			CtaTitleID: "Barang bergerak setiap menit.\nData Anda harus mengikuti.",
			CtaTitleEN: "Goods move every minute.\nYour data should keep up.",
			CtaBanner:  imgSolutionCta,

			Order:     4,
			Published: true,
			Features: []models.SolutionFeature{
				{
					LabelID: "Pelacakan Armada", LabelEN: "Fleet Tracking",
					TitleID: "Posisi kendaraan terpantau berikut peringatan area",
					TitleEN: "Vehicle position tracked with geofence alerts",
					DescID:  "Titik lokasi kendaraan terekam berkala dan memicu peringatan bila keluar dari area yang ditentukan.",
					DescEN:  "Vehicle positions are logged periodically and trigger alerts when leaving a defined zone.",
					Order:   1,
				},
				{
					LabelID: "Optimasi Rute", LabelEN: "Route Optimization",
					TitleID: "Urutan pengantaran yang disusun ulang otomatis",
					TitleEN: "Delivery sequences reordered automatically",
					DescID:  "Rute dihitung berdasarkan jarak, jendela waktu, dan kapasitas kendaraan untuk menekan biaya bahan bakar.",
					DescEN:  "Routes are computed from distance, time windows, and vehicle capacity to cut fuel cost.",
					Order:   2,
				},
				{
					LabelID: "Gudang", LabelEN: "Warehouse",
					TitleID: "Pergerakan barang tercatat lewat pemindaian",
					TitleEN: "Goods movement recorded by scanning",
					DescID:  "Penerimaan, penyimpanan, dan pengeluaran barang dicatat dengan pemindaian sehingga selisih stok bisa dilacak sampai transaksinya.",
					DescEN:  "Receiving, put-away, and issuing are captured by scan, so stock variances can be traced to the transaction.",
					Order:   3,
				},
				{
					LabelID: "Bukti Kirim", LabelEN: "Proof of Delivery",
					TitleID: "Bukti serah terima digital langsung dari lapangan",
					TitleEN: "Digital handover proof straight from the field",
					DescID:  "Pengemudi merekam tanda tangan dan foto serah terima, tersimpan bersama data pengiriman.",
					DescEN:  "Drivers capture signature and handover photos, stored alongside the shipment record.",
					Order:   4,
				},
			},
			UseCases: []models.SolutionUseCase{
				{TitleID: "Distribusi Multi-Rute", TitleEN: "Multi-Route Distribution", DescID: "Menyusun beban muatan dan urutan antar untuk banyak kendaraan sekaligus.", DescEN: "Plans load allocation and drop sequence for many vehicles at once.", Order: 1},
				{TitleID: "Akurasi Persediaan Gudang", TitleEN: "Warehouse Inventory Accuracy", DescID: "Menekan selisih stok dengan pencatatan berbasis pemindaian di setiap perpindahan.", DescEN: "Reduces stock variance with scan-based recording at every movement.", Order: 2},
				{TitleID: "Pemantauan Ketepatan Waktu", TitleEN: "On-Time Delivery Monitoring", DescID: "Melihat rute mana yang sering terlambat dan apa penyebab yang berulang.", DescEN: "Reveals which routes run late and what the recurring cause is.", Order: 3},
				{TitleID: "Kendali Biaya Bahan Bakar", TitleEN: "Fuel Cost Control", DescID: "Membandingkan konsumsi antar kendaraan dan pengemudi untuk menemukan pemborosan.", DescEN: "Compares consumption across vehicles and drivers to surface waste.", Order: 4},
			},
		},
		{
			Slug:      "custom-software",
			NameID:    "Perangkat Lunak Kustom",
			NameEN:    "Custom Software",
			EyebrowID: "Solusi untuk",
			EyebrowEN: "Solution for",
			TitleID:   "Sistem yang dibangun tepat sesuai cara kerja Anda",
			TitleEN:   "Systems built to match exactly how you work",
			DescID:    "Ketika perangkat lunak siap pakai tidak cocok dan langganannya terlalu mahal, RAMS merancang sistem khusus dari nol dengan arsitektur yang bisa Anda miliki sepenuhnya.",
			DescEN:    "When off-the-shelf software does not fit and its subscription is too costly, RAMS designs a bespoke system from scratch, with an architecture you fully own.",
			SummaryID: "Rancang bangun aplikasi web dan mobile khusus, dengan kode dan basis data yang tetap milik Anda.",
			SummaryEN: "Bespoke web and mobile applications, with the code and database remaining yours.",

			FeatureTitleID:    "Dari pemetaan proses sampai penyerahan sistem yang Anda miliki",
			FeatureTitleEN:    "From process mapping to handing over a system you own",
			CapabilityTitleID: "Perangkat lunak yang tumbuh mengikuti bisnis, bukan menahannya",
			CapabilityTitleEN: "Software that grows with the business instead of holding it back",
			CapabilityImage:   imgSolutionBg,

			CtaLabelID: "Ceritakan Kebutuhan Anda",
			CtaLabelEN: "Tell Us What You Need",
			CtaHref:    "/contact",
			CtaTitleID: "Kalau alur kerja Anda unik,\nsistemnya juga harus begitu.",
			CtaTitleEN: "If your workflow is unique,\nyour system should be too.",
			CtaBanner:  imgSolutionCta,

			Order:     5,
			Published: true,
			Features: []models.SolutionFeature{
				{
					LabelID: "Pemetaan Proses", LabelEN: "Process Mapping",
					TitleID: "Memahami pekerjaan sebelum menulis kode",
					TitleEN: "Understanding the work before writing code",
					DescID:  "Kami menelusuri alur kerja bersama tim Anda untuk menemukan titik hambat sesungguhnya, bukan yang diasumsikan.",
					DescEN:  "We walk the workflow with your team to find the real bottleneck, not the assumed one.",
					Order:   1,
				},
				{
					LabelID: "Arsitektur", LabelEN: "Architecture",
					TitleID: "Basis kode yang tertata dan mudah dilanjutkan",
					TitleEN: "A codebase that is organized and easy to continue",
					DescID:  "Struktur modular dengan pemisahan tanggung jawab yang jelas, sehingga pengembang lain bisa melanjutkan tanpa menebak.",
					DescEN:  "A modular structure with clear separation of concerns, so another developer can continue without guesswork.",
					Order:   2,
				},
				{
					LabelID: "Integrasi", LabelEN: "Integration",
					TitleID: "Menyambung dengan sistem yang sudah berjalan",
					TitleEN: "Connecting to systems already in place",
					DescID:  "Sistem baru berbicara dengan perangkat lunak lama, gerbang pembayaran, dan layanan pihak ketiga lewat antarmuka yang terdokumentasi.",
					DescEN:  "The new system talks to legacy software, payment gateways, and third-party services through documented interfaces.",
					Order:   3,
				},
				{
					LabelID: "Serah Terima", LabelEN: "Handover",
					TitleID: "Dokumentasi dan pelatihan yang membuat tim mandiri",
					TitleEN: "Documentation and training that make the team self-sufficient",
					DescID:  "Anda menerima kode, dokumentasi, dan pelatihan — bukan ketergantungan permanen pada satu vendor.",
					DescEN:  "You receive the code, the documentation, and the training — not a permanent dependency on one vendor.",
					Order:   4,
				},
			},
			UseCases: []models.SolutionUseCase{
				{TitleID: "Penggantian Proses Spreadsheet", TitleEN: "Replacing Spreadsheet Processes", DescID: "Memindahkan proses kritis dari berkas tersebar menjadi satu aplikasi dengan jejak audit.", DescEN: "Moves critical processes from scattered files into one application with an audit trail.", Order: 1},
				{TitleID: "Portal Pelanggan & Mitra", TitleEN: "Customer & Partner Portals", DescID: "Memberi pelanggan akses mandiri ke status pesanan, tagihan, dan dokumen.", DescEN: "Gives customers self-service access to order status, invoices, and documents.", Order: 2},
				{TitleID: "Otomasi Pekerjaan Berulang", TitleEN: "Automating Repetitive Work", DescID: "Menggantikan penyalinan data manual antar sistem dengan proses terjadwal.", DescEN: "Replaces manual data copying between systems with scheduled processes.", Order: 3},
				{TitleID: "Aplikasi Internal Tim Lapangan", TitleEN: "Internal Field Team Apps", DescID: "Aplikasi mobile ringan untuk tim lapangan yang tetap berfungsi di area sinyal lemah.", DescEN: "Lightweight mobile apps for field teams that keep working in weak-signal areas.", Order: 4},
			},
		},
	}

	for i := range solutions {
		if err := database.Create(&solutions[i]).Error; err != nil {
			log.Printf("❌ Failed to seed solution %s: %v", solutions[i].Slug, err)
		}
	}
	log.Println("✅ Solutions seeded (5 lines with features & use cases, ID + EN)")
}

func seedProducts(database *gorm.DB) {
	var count int64
	database.Model(&models.Product{}).Count(&count)
	if count > 0 {
		return
	}

	product := models.Product{
		Slug:      "sidra",
		NameID:    "SIDRA",
		NameEN:    "SIDRA",
		TitleID:   "Superapp ERP untuk Grup Usaha",
		TitleEN:   "Superapp ERP for Business Groups",
		TaglineID: "Satu platform multi-tenan yang menyatukan ERP, kasir, gudang, akuntansi, dan CRM — dirancang agar beberapa badan usaha bisa berjalan tanpa saling menunggu.",
		TaglineEN: "A single multi-tenant platform uniting ERP, point of sale, warehouse, accounting, and CRM — built so several legal entities can operate without waiting on each other.",

		HeroImageURL: imgHero,

		PromptsID: "Berapa margin proyek cetak bulan ini?\nStok bahan baku mana yang mendekati titik pesan ulang?\nOutlet mana yang penjualannya turun minggu ini?\nTampilkan laporan laba rugi konsolidasi grup\nSiapa penanggung jawab work order yang terlambat?\nBandingkan HPP rencana dengan realisasi",
		PromptsEN: "What is this month's print project margin?\nWhich raw materials are near their reorder point?\nWhich outlet's sales dropped this week?\nShow the consolidated group income statement\nWho owns the overdue work orders?\nCompare planned versus actual cost of goods",

		AcronymTitleID: "SIDRA dibangun di atas lima prinsip",
		AcronymTitleEN: "SIDRA is built on five principles",

		CtaTitleID: "Coba SIDRA untuk grup usaha Anda.",
		CtaTitleEN: "Try SIDRA for your business group.",
		CtaLabelID: "Minta Demo",
		CtaLabelEN: "Request a Demo",
		CtaHref:    "/contact",

		Order:     1,
		Published: true,

		Values: []models.ProductValue{
			{Letter: "S", TitleID: "Sinkron", TitleEN: "Synchronized", DescID: "Satu perubahan data langsung terlihat di seluruh modul terkait", DescEN: "One data change is immediately visible across every related module", Order: 1},
			{Letter: "I", TitleID: "Integratif", TitleEN: "Integrated", DescID: "Kasir, gudang, produksi, dan keuangan berbagi satu sumber kebenaran", DescEN: "Cashier, warehouse, production, and finance share one source of truth", Order: 2},
			{Letter: "D", TitleID: "Dapat Diaudit", TitleEN: "Auditable", DescID: "Setiap transaksi menyimpan jejak siapa, kapan, dan apa yang berubah", DescEN: "Every transaction records who changed what and when", Order: 3},
			{Letter: "R", TitleID: "Ringan", TitleEN: "Responsive", DescID: "Berjalan cepat di perangkat sederhana dan koneksi terbatas", DescEN: "Runs fast on modest devices and limited connections", Order: 4},
			{Letter: "A", TitleID: "Adaptif", TitleEN: "Adaptable", DescID: "Modul bisa ditambah mengikuti pertumbuhan tanpa membangun ulang", DescEN: "Modules can be added as you grow without a rebuild", Order: 5},
		},
		Features: []models.ProductFeature{
			{
				TitleID: "Inti ERP Multi-Tenan",
				TitleEN: "Multi-Tenant ERP Core",
				DescID:  "Setiap badan usaha memiliki ruang datanya sendiri, namun laporan grup tetap bisa dikonsolidasikan. Transaksi antar-perusahaan tercatat dua arah secara otomatis.",
				DescEN:  "Each legal entity gets its own data space while group reporting still consolidates. Inter-company transactions are recorded on both sides automatically.",
				Order:   1,
			},
			{
				TitleID: "Kasir Terhubung Langsung ke Gudang",
				TitleEN: "Cashier Wired Directly to the Warehouse",
				DescID:  "Penjualan di outlet langsung mengurangi stok gudang terkait dan memicu peringatan pengisian ulang, tanpa entri ganda.",
				DescEN:  "An outlet sale immediately decrements the relevant warehouse stock and triggers a replenishment alert, with no double entry.",
				Order:   2,
			},
			{
				TitleID: "Buku Besar yang Selalu Seimbang",
				TitleEN: "A Ledger That Is Always Balanced",
				DescID:  "Jurnal terbentuk otomatis dari transaksi operasional, sehingga laporan keuangan tidak perlu disusun ulang di akhir bulan.",
				DescEN:  "Journals are generated automatically from operational transactions, so financial statements need no month-end rebuild.",
				Order:   3,
			},
			{
				TitleID: "CRM dan Notifikasi Terpadu",
				TitleEN: "Unified CRM and Notifications",
				DescID:  "Riwayat interaksi pelanggan, penawaran, dan pengingat pembayaran berada di satu tempat, terhubung ke kanal pesan yang Anda pakai.",
				DescEN:  "Customer interaction history, quotations, and payment reminders live in one place, connected to the messaging channels you already use.",
				Order:   4,
			},
		},
	}

	if err := database.Create(&product).Error; err != nil {
		log.Printf("❌ Failed to seed product: %v", err)
		return
	}
	log.Println("✅ Flagship product SIDRA seeded")
}

func seedArticleCategories(database *gorm.DB) {
	var count int64
	database.Model(&models.ArticleCategory{}).Count(&count)
	if count > 0 {
		return
	}

	categories := []models.ArticleCategory{
		{Slug: "updates", NameID: "Pembaruan", NameEN: "Updates", Order: 1},
		{Slug: "news", NameID: "Berita", NameEN: "News", Order: 2},
		{Slug: "event", NameID: "Acara", NameEN: "Event", Order: 3},
		{Slug: "use-case", NameID: "Studi Kasus", NameEN: "Use Case", Order: 4},
	}
	for i := range categories {
		database.Create(&categories[i])
	}
	log.Println("✅ Article categories seeded")
}

func seedArticles(database *gorm.DB) {
	var count int64
	database.Model(&models.Article{}).Count(&count)
	if count > 0 {
		return
	}

	catID := map[string]uint{}
	var categories []models.ArticleCategory
	database.Find(&categories)
	for _, c := range categories {
		catID[c.Slug] = c.ID
	}

	articles := []models.Article{
		{
			Slug:       "erp-percetakan-sidomulyo-advertising",
			CategoryID: catID["use-case"],
			TitleID:    "Menyusun ERP Percetakan untuk Sidomulyo Advertising",
			TitleEN:    "Building a Printing ERP for Sidomulyo Advertising",
			ExcerptID:  "Bagaimana perhitungan harga pokok produksi yang sebelumnya memakan waktu berhari-hari dipindahkan ke dalam satu alur kerja terukur.",
			ExcerptEN:  "How a cost-of-goods calculation that previously took days was moved into one measurable workflow.",
			ContentID: `Industri percetakan memiliki karakter biaya yang tidak sederhana. Satu pesanan bisa melibatkan beberapa jenis bahan, ukuran potong yang berbeda, tingkat waste yang bervariasi, serta pekerjaan finishing yang dikerjakan bertahap.

Sebelum sistem dibangun, perhitungan harga pokok produksi dilakukan terpisah dari pencatatan stok dan keuangan. Akibatnya, angka margin baru diketahui setelah pekerjaan selesai — terlalu terlambat untuk mengoreksi harga penawaran.

## Pendekatan yang diambil

Kami memulai dengan menelusuri alur kerja yang sedang berjalan, dari penerimaan order sampai serah terima. Dari pemetaan itu terlihat bahwa masalah utamanya bukan ketiadaan data, melainkan data yang tersebar di beberapa tempat tanpa saling terhubung.

Sistem kemudian dirancang agar setiap pemakaian bahan dan jam kerja mesin tercatat pada work order yang sama. Dengan begitu, perhitungan harga pokok terbentuk seiring pekerjaan berjalan, bukan disusun ulang setelahnya.

## Hasil operasional

Penyusunan laporan keuangan bulanan yang sebelumnya membutuhkan beberapa hari kerja kini dapat dihasilkan langsung dari data transaksi. Yang lebih penting, tim penjualan dapat melihat estimasi margin sebelum penawaran dikirim.`,
			ContentEN: `Printing has an awkward cost structure. A single order can involve several material types, different cut sizes, variable waste rates, and finishing work done in stages.

Before the system was built, cost-of-goods calculation happened separately from inventory and financial records. As a result, margin figures only surfaced after a job was complete — far too late to correct the quoted price.

## The approach taken

We started by walking the existing workflow, from order intake through to handover. That mapping showed the core problem was not missing data but data scattered across several places with nothing connecting it.

The system was then designed so that every material draw and machine hour is recorded against the same work order. Costing therefore accumulates as the work progresses rather than being reconstructed afterwards.

## Operational outcome

Monthly financial reporting that previously took several working days can now be generated directly from transaction data. More importantly, the sales team can see an estimated margin before a quote goes out.`,
			ImageURL:    "https://images.unsplash.com/photo-1562564055-71e051d33c19?w=1600&q=80",
			Author:      "Tim RAMS",
			Status:      "published",
			Featured:    true,
			ReadTime:    "6",
			PublishedAt: models.NewDateOnly(time.Date(2026, 6, 18, 9, 0, 0, 0, time.UTC)),
		},
		{
			Slug:       "pos-offline-first-jaringan-tidak-stabil",
			CategoryID: catID["updates"],
			TitleID:    "Mengapa Kasir Harus Dirancang Luring Terlebih Dahulu",
			TitleEN:    "Why a Cashier System Should Be Designed Offline-First",
			ExcerptID:  "Koneksi internet di banyak lokasi usaha belum dapat diandalkan. Sistem kasir yang bergantung penuh pada jaringan akan berhenti tepat saat paling dibutuhkan.",
			ExcerptEN:  "Connectivity at many business locations is still unreliable. A cashier system that fully depends on the network stops exactly when it is needed most.",
			ContentID: `Banyak sistem kasir berbasis web mengasumsikan koneksi yang selalu tersedia. Asumsi ini sering tidak terpenuhi di lokasi usaha nyata — di pasar, di lantai dasar pusat perbelanjaan, atau di daerah dengan jaringan seluler yang naik turun.

Ketika koneksi terputus, sistem yang bergantung sepenuhnya pada server akan berhenti menerima transaksi. Antrean pelanggan menumpuk, dan tim biasanya beralih ke pencatatan manual yang kemudian harus dimasukkan ulang.

## Menyimpan lokal lebih dulu

Pendekatan luring-pertama membalik urutannya. Transaksi ditulis ke basis data lokal di perangkat kasir terlebih dahulu, dan barulah disinkronkan ke pusat ketika koneksi tersedia. Dari sudut pandang kasir, sistem tidak pernah menunggu jaringan.

Bagian yang menuntut ketelitian adalah proses penyelarasan. Data yang menumpuk selama luring tidak boleh dikirim sekaligus, karena dapat membebani server. Pengiriman dilakukan bertahap dengan jeda yang meningkat bila terjadi kegagalan.

## Yang perlu diputuskan lebih awal

Beberapa hal harus disepakati di awal perancangan: bagaimana penomoran struk dijaga agar tidak bertabrakan antar perangkat, bagaimana perubahan harga dari pusat diterapkan, dan data mana yang boleh dibaca luring.`,
			ContentEN: `Many web-based point-of-sale systems assume connectivity is always available. That assumption often fails at real business locations — in a market, on a mall's ground floor, or in an area where mobile signal fluctuates.

When the connection drops, a system that depends entirely on the server stops accepting transactions. The customer queue builds up, and staff typically fall back to manual notes that must later be re-entered.

## Writing locally first

An offline-first approach inverts the order. Transactions are written to a local database on the cashier device first, and synced to the central system once connectivity is available. From the cashier's perspective, the system never waits on the network.

The part that demands care is reconciliation. Data accumulated while offline must not be pushed all at once, as that can overwhelm the server. Uploads proceed incrementally with increasing backoff when failures occur.

## Decisions to settle early

A few things must be agreed during design: how receipt numbering avoids collisions across devices, how central price changes are applied, and which data may be read while offline.`,
			ImageURL:    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&q=80",
			Author:      "Tim RAMS",
			Status:      "published",
			ReadTime:    "5",
			PublishedAt: models.NewDateOnly(time.Date(2026, 5, 22, 9, 0, 0, 0, time.UTC)),
		},
		{
			Slug:       "tixnova-arsitektur-ruang-tunggu-tiket",
			CategoryID: catID["use-case"],
			TitleID:    "TixNova: Menahan Lonjakan Pembelian Tiket dengan Ruang Tunggu",
			TitleEN:    "TixNova: Absorbing Ticket Purchase Surges With a Waiting Room",
			ExcerptID:  "Penjualan tiket konser menciptakan pola trafik yang ekstrem dalam hitungan detik. Arsitekturnya harus menahan beban itu tanpa mengacaukan keadilan antrean.",
			ExcerptEN:  "Concert ticket sales create an extreme traffic pattern within seconds. The architecture must absorb that load without breaking queue fairness.",
			ContentID: `Penjualan tiket konser adalah salah satu pola beban paling berat yang bisa dihadapi sebuah sistem. Trafik meningkat tajam pada detik pembukaan, lalu turun kembali dalam beberapa menit.

Jika semua permintaan diteruskan langsung ke basis data, yang terjadi bukan hanya perlambatan, tetapi juga penguncian baris yang saling menunggu. Akibatnya sebagian pembeli mendapat kesalahan sistem meski kuota masih tersedia.

## Ruang tunggu bertoken

Solusinya adalah memisahkan proses masuk dari proses transaksi. Pembeli lebih dulu masuk ke antrean bertoken. Sistem melepaskan token ke tahap pembelian dengan laju yang bisa ditangani basis data.

Pendekatan ini memiliki manfaat tambahan yang sering diabaikan: keadilan. Karena urutan antrean ditetapkan saat token diberikan, pembeli dengan koneksi lebih cepat tidak otomatis mendahului yang lain.

## Validasi di gerbang

Masalah berikutnya muncul di hari acara. Ribuan pengunjung tiba dalam rentang waktu pendek, sering di lokasi dengan jaringan padat. Karena itu aplikasi pemindai dirancang agar dapat memvalidasi tanda tangan digital tiket secara luring, lalu menyelaraskan catatan validasi setelahnya.`,
			ContentEN: `A concert on-sale is one of the harshest load patterns a system can face. Traffic spikes sharply at the opening second, then subsides within minutes.

If every request is forwarded straight to the database, the result is not merely slowdown but row locks waiting on each other. Some buyers then receive system errors even while quota remains available.

## A token waiting room

The fix is to separate entry from transaction. Buyers first join a token queue. The system releases tokens into the purchase stage at a rate the database can actually sustain.

This approach has an additional and often overlooked benefit: fairness. Because queue order is fixed when the token is issued, buyers on faster connections do not automatically jump ahead.

## Validation at the gate

The next problem appears on event day. Thousands of visitors arrive within a short window, often at a location with congested networks. The scanner app is therefore designed to validate a ticket's digital signature offline, then sync validation records afterwards.`,
			ImageURL:    "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1600&q=80",
			Author:      "Tim RAMS",
			Status:      "published",
			ReadTime:    "7",
			PublishedAt: models.NewDateOnly(time.Date(2026, 4, 9, 9, 0, 0, 0, time.UTC)),
		},
		{
			Slug:       "rams-resmi-beroperasi-sebagai-agensi-perangkat-lunak",
			CategoryID: catID["news"],
			TitleID:    "RAMS Resmi Beroperasi sebagai Agensi Perangkat Lunak",
			TitleEN:    "RAMS Formally Begins Operating as a Software Agency",
			ExcerptID:  "Setelah beberapa tahun membangun sistem untuk kebutuhan usaha sendiri, PT Ragam Manfaat Sinergi membuka layanan pengembangan perangkat lunak untuk pihak luar.",
			ExcerptEN:  "After several years building systems for its own operations, PT Ragam Manfaat Sinergi opens its software development services to external clients.",
			ContentID: `PT Ragam Manfaat Sinergi resmi beroperasi sebagai agensi pengembangan web dan perangkat lunak. Keputusan ini merupakan kelanjutan dari pengalaman membangun dan menjalankan sistem untuk kebutuhan usaha sendiri sejak 2018.

Selama periode tersebut, sistem yang dibangun mencakup platform media, e-commerce, sistem kasir luring-pertama, ERP percetakan, sampai infrastruktur ticketing. Semuanya dipakai dalam operasional nyata, bukan sebagai proyek percontohan.

## Alasan pembukaan layanan

Pola yang berulang kami temui adalah pelaku usaha yang terjebak antara dua pilihan tidak ideal: perangkat lunak berlangganan yang biayanya terus naik namun tidak sesuai kebutuhan, atau pengembangan kustom dengan biaya di luar jangkauan.

Layanan RAMS diarahkan untuk mengisi celah tersebut, dengan penekanan pada kepemilikan sistem oleh klien: kode, basis data, dan dokumentasi diserahkan sepenuhnya.`,
			ContentEN: `PT Ragam Manfaat Sinergi is now formally operating as a web and software development agency. The decision follows several years of building and running systems for its own business needs since 2018.

Over that period the systems built spanned media platforms, e-commerce, an offline-first point-of-sale system, a printing ERP, and ticketing infrastructure. All of them ran in real operations, not as pilot projects.

## Why the services are opening up

The recurring pattern we encountered was business operators caught between two unsatisfying options: subscription software whose cost keeps climbing while never quite fitting, or custom development priced out of reach.

RAMS services are aimed at that gap, with an emphasis on client ownership: code, database, and documentation are handed over in full.`,
			ImageURL:    "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1600&q=80",
			Author:      "Tim RAMS",
			Status:      "published",
			ReadTime:    "4",
			PublishedAt: models.NewDateOnly(time.Date(2026, 3, 3, 9, 0, 0, 0, time.UTC)),
		},
		{
			Slug:       "catatan-migrasi-data-warisan-spreadsheet",
			CategoryID: catID["updates"],
			TitleID:    "Catatan Lapangan: Memindahkan Proses dari Spreadsheet ke Sistem",
			TitleEN:    "Field Notes: Moving a Process Out of Spreadsheets",
			ExcerptID:  "Bagian tersulit dari migrasi bukan memindahkan datanya, melainkan menemukan aturan bisnis yang selama ini hanya ada di kepala satu dua orang.",
			ExcerptEN:  "The hardest part of a migration is not moving the data, but uncovering the business rules that live only in one or two people's heads.",
			ContentID: `Hampir setiap proyek yang kami kerjakan diawali dengan spreadsheet. Berkas yang sudah berjalan bertahun-tahun, penuh rumus bertumpuk, dan biasanya hanya benar-benar dipahami oleh satu atau dua orang.

Memindahkan angkanya ke basis data adalah pekerjaan yang relatif lurus. Yang menuntut waktu adalah menemukan aturan tak tertulis di dalamnya.

## Aturan yang tidak terdokumentasi

Pada satu proyek, kami menemukan kolom yang secara diam-diam menerapkan pembulatan berbeda untuk pelanggan tertentu. Tidak ada catatan mengenai hal ini; kebijakannya diingat oleh staf yang mengelola berkas tersebut.

Bila aturan seperti ini terlewat, sistem baru akan menghasilkan angka yang berbeda dari yang biasa dilihat pengguna. Perbedaan kecil pun cukup untuk membuat tim kehilangan kepercayaan pada sistem.

## Pendekatan yang kami pakai

Kami menjalankan sistem baru berdampingan dengan spreadsheet selama satu periode penuh, lalu membandingkan hasilnya baris demi baris. Setiap selisih ditelusuri sampai ditemukan penyebabnya — dan hampir selalu penyebabnya adalah aturan yang belum terungkap.`,
			ContentEN: `Almost every project we take on begins with a spreadsheet. A file that has been running for years, dense with stacked formulas, and usually understood in full by only one or two people.

Moving the numbers into a database is relatively straightforward work. What takes time is uncovering the unwritten rules inside it.

## The undocumented rules

On one project we found a column that quietly applied different rounding for certain customers. Nothing documented it; the policy lived in the memory of the staff member who maintained the file.

When a rule like that is missed, the new system produces numbers that differ from what users are used to seeing. Even a small discrepancy is enough to cost the team's trust in the system.

## The approach we use

We run the new system alongside the spreadsheet for a full period, then compare results row by row. Every discrepancy is traced to its cause — and the cause is almost always a rule that had not yet surfaced.`,
			ImageURL:    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&q=80",
			Author:      "Tim RAMS",
			Status:      "published",
			ReadTime:    "5",
			PublishedAt: models.NewDateOnly(time.Date(2026, 2, 11, 9, 0, 0, 0, time.UTC)),
		},
		{
			Slug:       "workshop-digitalisasi-umkm-semarang",
			CategoryID: catID["event"],
			TitleID:    "Lokakarya Digitalisasi Operasional UMKM di Semarang",
			TitleEN:    "SME Operational Digitalisation Workshop in Semarang",
			ExcerptID:  "Sesi praktik bersama pelaku usaha kecil membahas cara memilih sistem yang sesuai skala, dan kapan sebaiknya belum berinvestasi pada perangkat lunak.",
			ExcerptEN:  "A hands-on session with small business operators on choosing systems that match their scale, and when not to invest in software yet.",
			ContentID: `RAMS mengadakan lokakarya bersama pelaku usaha kecil dan menengah di Semarang mengenai digitalisasi operasional. Fokus sesi bukan pada teknologi, melainkan pada pengambilan keputusan sebelum teknologi dibeli.

Salah satu bahasan yang paling banyak menarik pertanyaan adalah kapan sebuah usaha sebaiknya belum berinvestasi pada perangkat lunak. Tidak semua kendala operasional terselesaikan oleh sistem; sebagian justru berakar pada proses yang belum jelas.

## Materi yang dibahas

Sesi mencakup cara memetakan proses yang sedang berjalan, mengenali titik hambat yang sesungguhnya, serta memperkirakan biaya kepemilikan sistem dalam jangka menengah — termasuk biaya yang sering tidak dihitung seperti pelatihan dan migrasi data.

## Tindak lanjut

Beberapa peserta melanjutkan dengan sesi pemetaan proses lebih mendalam. Materi lokakarya tersedia bagi peserta yang meminta melalui halaman kontak.`,
			ContentEN: `RAMS ran a workshop with small and medium business operators in Semarang on operational digitalisation. The session focused less on technology than on the decisions made before technology is purchased.

The topic that drew the most questions was when a business should not yet invest in software. Not every operational problem is solved by a system; some are rooted in a process that is not yet clear.

## What was covered

The session covered mapping the current process, identifying the real bottleneck, and estimating medium-term cost of ownership — including costs that often go uncounted, such as training and data migration.

## Follow-up

Several participants continued with a deeper process-mapping session. Workshop materials are available to attendees on request through the contact page.`,
			ImageURL:    "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1600&q=80",
			Author:      "Tim RAMS",
			Status:      "published",
			ReadTime:    "4",
			PublishedAt: models.NewDateOnly(time.Date(2026, 1, 24, 9, 0, 0, 0, time.UTC)),
		},
	}

	for i := range articles {
		articles[i].CreatedAt = articles[i].PublishedAt.Time
		articles[i].UpdatedAt = articles[i].PublishedAt.Time
		if err := database.Create(&articles[i]).Error; err != nil {
			log.Printf("❌ Failed to seed article %s: %v", articles[i].Slug, err)
		}
	}
	log.Println("✅ Articles seeded (6 bilingual entries)")
}

func seedApproachSteps(database *gorm.DB) {
	var count int64
	database.Model(&models.ApproachStep{}).Count(&count)
	if count > 0 {
		return
	}

	steps := []models.ApproachStep{
		{
			Number:  "01.",
			TitleID: "Memahami Bisnisnya Dulu",
			TitleEN: "Understand the Business First",
			DescID:  "Kami mulai dengan menelusuri alur kerja Anda apa adanya — termasuk kebiasaan operasional dan pekerjaan manual yang selama ini menutup celah sistem. Dari situ kami menemukan hambatan yang sesungguhnya, bukan yang diasumsikan.",
			DescEN:  "We begin by walking your workflow exactly as it runs today — including the operational habits and manual work that have been patching gaps. That is how we find the real bottleneck rather than the assumed one.",
			Order:   1,
		},
		{
			Number:  "02.",
			TitleID: "Merancang dan Membangun Solusi yang Tepat",
			TitleEN: "Design and Build the Right Solution",
			DescID:  "Sistem dirancang menyesuaikan proses Anda, bukan memaksa proses berubah demi perangkat lunak. Kami bangun bertahap agar bagian yang paling menghambat bisa dipakai lebih dulu.",
			DescEN:  "The system is designed to fit your process, not to force your process to bend around the software. We build incrementally so the most painful part becomes usable first.",
			Order:   2,
		},
		{
			Number:  "03.",
			TitleID: "Mendampingi, Mengamankan, dan Mengembangkan",
			TitleEN: "Support, Secure, and Evolve",
			DescID:  "Setelah go-live kami tetap mendampingi: pelatihan tim, pemantauan, perbaikan, dan penambahan modul mengikuti pertumbuhan usaha. Kode dan dokumentasi tetap milik Anda.",
			DescEN:  "After go-live we stay involved: team training, monitoring, fixes, and additional modules as the business grows. The code and documentation remain yours.",
			Order:   3,
		},
	}
	for i := range steps {
		database.Create(&steps[i])
	}
	log.Println("✅ Approach steps seeded")
}

func seedLegalPages(database *gorm.DB) {
	var count int64
	database.Model(&models.LegalPage{}).Count(&count)
	if count > 0 {
		return
	}

	pages := []models.LegalPage{
		{
			Slug:    "privacy-policy",
			TitleID: "Kebijakan Privasi",
			TitleEN: "Privacy Policy",
			BodyID: `## Data yang Kami Kumpulkan

Kami mengumpulkan data yang Anda kirimkan secara sukarela melalui formulir kontak: nama, alamat email, nama perusahaan, nomor telepon, solusi yang diminati, dan isi pesan.

Kami juga mencatat data teknis dasar seperti alamat IP untuk keperluan pembatasan laju permintaan dan pencegahan penyalahgunaan formulir.

## Penggunaan Data

Data yang Anda kirimkan digunakan semata-mata untuk menanggapi permintaan Anda dan menindaklanjuti diskusi terkait kebutuhan sistem. Kami tidak menjual, menyewakan, atau memperdagangkan data Anda kepada pihak ketiga.

## Penyimpanan dan Keamanan

Data disimpan pada basis data terkontrol dengan akses terbatas pada personel yang berkepentingan. Kata sandi akun administrator disimpan dalam bentuk hash, tidak dalam bentuk teks biasa.

## Hak Anda

Anda dapat meminta akses, koreksi, atau penghapusan data yang Anda kirimkan kepada kami dengan menghubungi alamat email yang tercantum pada halaman kontak.

## Perubahan Kebijakan

Kebijakan ini dapat diperbarui dari waktu ke waktu. Tanggal pembaruan terakhir tercantum pada bagian bawah halaman ini.`,
			BodyEN: `## Data We Collect

We collect the data you voluntarily submit through the contact form: name, email address, company name, phone number, solution of interest, and message content.

We also record basic technical data such as IP address for rate limiting and to prevent form abuse.

## How Data Is Used

The data you submit is used solely to respond to your enquiry and to follow up on discussions about your system requirements. We do not sell, rent, or trade your data to third parties.

## Storage and Security

Data is stored in a controlled database with access limited to relevant personnel. Administrator account passwords are stored as hashes, never as plain text.

## Your Rights

You may request access to, correction of, or deletion of the data you submitted by contacting the email address listed on the contact page.

## Changes to This Policy

This policy may be updated from time to time. The date of the most recent update appears at the bottom of this page.`,
		},
		{
			Slug:    "terms-and-conditions",
			TitleID: "Syarat & Ketentuan",
			TitleEN: "Terms & Conditions",
			BodyID: `## Penggunaan Situs

Situs ini disediakan untuk memberikan informasi mengenai layanan PT Ragam Manfaat Sinergi. Dengan mengakses situs ini, Anda menyetujui ketentuan yang tercantum pada halaman ini.

## Informasi pada Situs

Kami berupaya menjaga keakuratan informasi yang ditampilkan. Namun, spesifikasi teknis, cakupan layanan, dan contoh implementasi dapat berubah sesuai perkembangan produk dan kebutuhan proyek.

Contoh angka performa atau hasil implementasi yang ditampilkan merujuk pada kondisi proyek tertentu dan tidak merupakan jaminan hasil yang sama pada lingkungan lain.

## Ruang Lingkup Layanan

Ruang lingkup pekerjaan, tenggat, biaya, dan ketentuan pemeliharaan untuk setiap proyek diatur dalam perjanjian tertulis terpisah antara RAMS dan klien. Informasi pada situs ini bukan merupakan penawaran yang mengikat.

## Kekayaan Intelektual

Merek, logo, dan materi pada situs ini merupakan milik PT Ragam Manfaat Sinergi, kecuali dinyatakan lain. Kepemilikan kode dan dokumentasi hasil pekerjaan proyek diatur dalam perjanjian dengan klien.

## Tautan Pihak Ketiga

Situs ini dapat memuat tautan ke layanan pihak ketiga. Kami tidak bertanggung jawab atas isi maupun kebijakan pada situs pihak ketiga tersebut.`,
			BodyEN: `## Use of This Site

This site is provided to present information about the services of PT Ragam Manfaat Sinergi. By accessing it, you agree to the terms set out on this page.

## Information on the Site

We work to keep the information displayed accurate. However, technical specifications, service scope, and implementation examples may change as products and project requirements evolve.

Any performance figures or implementation results shown refer to specific project conditions and are not a guarantee of identical results in another environment.

## Scope of Services

The scope of work, timelines, fees, and maintenance terms for each project are governed by a separate written agreement between RAMS and the client. Information on this site does not constitute a binding offer.

## Intellectual Property

Trademarks, logos, and materials on this site belong to PT Ragam Manfaat Sinergi unless stated otherwise. Ownership of code and documentation produced during a project is governed by the client agreement.

## Third-Party Links

This site may contain links to third-party services. We are not responsible for the content or policies of those third-party sites.`,
		},
	}
	for i := range pages {
		pages[i].UpdatedAt = time.Now()
		database.Create(&pages[i])
	}
	log.Println("✅ Legal pages seeded")
}
