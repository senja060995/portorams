package db

import (
	"log"

	"rams-backend/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func SeedDatabase(database *gorm.DB) {
	// 1. Seed Admin User
	var userCount int64
	database.Model(&models.User{}).Count(&userCount)
	if userCount == 0 {
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
		admin := models.User{
			Username: "admin",
			Email:    "admin@rams.co.id",
			Password: string(hashedPassword),
			Role:     "admin",
		}
		database.Create(&admin)
		log.Println("✅ Admin user seeded: admin / admin123")
	}

	// 5. Seed Milestones (Full Authentic History 2018 - 2026)
	var milestoneCount int64
	database.Model(&models.Milestone{}).Count(&milestoneCount)
	if milestoneCount < 9 {
		database.Exec("DELETE FROM milestones")
		milestones := []models.Milestone{
			{
				Year:        "2018",
				Title:       "Membangun Dari Masalah Lapangan",
				Subtitle:    "Perjalanan Awal Berbasis Solusi Nyata",
				Description: "RAMS lahir dari keberanian menghadapi berbagai permasalahan bisnis nyata di lapangan. Mulai membangun aplikasi-aplikasi sederhana yang didesain presisi untuk menyelesaikan kendala operasional awal.",
				Icon:        "Rocket",
				ScaleBadge:  "Genesis Phase",
				Order:       1,
			},
			{
				Year:        "2019",
				Title:       "Kolaborasi Ekosistem Santri Online & E-Commerce",
				Subtitle:    "Media Berita, Distro Kang Santri & Platform Ngaji Progresif",
				Description: "Bergabung dan berkolaborasi bersama Santri Online menciptakan platform media berita digital. Mendirikan e-commerce Distro Kang Santri (busana santri), platform bimbingan mengaji Santri Progresif, serta aplikasi pembukuan keuangan internal.",
				Icon:        "Globe2",
				ScaleBadge:  "Ecosystem & Commerce",
				Order:       2,
			},
			{
				Year:        "2020",
				Title:       "Ekspansi Sistem Digital Marketing & SEO",
				Subtitle:    "Pengembangan Engine Iklan & Optimasi Penjualan",
				Description: "Mengembangkan platform dan sistem Digital Marketing khusus untuk mendukung akselerasi penjualan online melalui optimasi SEO internet berkinerja tinggi serta iklan Facebook Ads yang presisi dan tepat sasaran.",
				Icon:        "Zap",
				ScaleBadge:  "Digital Marketing Engine",
				Order:       3,
			},
			{
				Year:        "2021",
				Title:       "Inovasi Blockchain & Agri-Tech Digital NFT",
				Subtitle:    "Menggabungkan Teknologi Blockchain dengan Pertanian Nyata",
				Description: "Tertarik pada proyek metaverse dan Web3, namun melihat banyaknya aset tanpa fundamental nyata. RAMS membangun Digital NFT Agriculture—mengintegrasikan teknologi blockchain dengan proyek pertanian riil yang ber-fundamental kuat.",
				Icon:        "Cpu",
				ScaleBadge:  "Web3 & Agri-Tech",
				Order:       4,
			},
			{
				Year:        "2022",
				Title:       "Operasional NFT Agriculture & Stabilitas Sistem",
				Subtitle:    "Pengelolaan Aset Riil & Ekosistem Terdesentralisasi",
				Description: "Proyek NFT Agriculture berjalan dengan lancar dan stabil, membuktikan integrasi teknologi Web3 dengan sektor riil pertanian dapat beroperasi secara akurat dan berkelanjutan.",
				Icon:        "ShieldCheck",
				ScaleBadge:  "Real-Asset Blockchain",
				Order:       5,
			},
			{
				Year:        "2023",
				Title:       "Agency Digital Marketing & Live Streaming Commerce",
				Subtitle:    "Dukungan Live Commerce TikTok & Facebook Ads",
				Description: "Memperluas jangkauan layanan dengan mendirikan jasa Digital Marketing Agency dan infrastruktur pendukung live streaming e-commerce di TikTok & Facebook untuk membantu brand lokal meningkatkan konversi penjualan.",
				Icon:        "MessageSquare",
				ScaleBadge:  "Live Streaming Agency",
				Order:       6,
			},
			{
				Year:        "2024",
				Title:       "Sistem POS & ERP Mandiri Bisnis Franchise",
				Subtitle:    "Rancang Bangun POS Offline-First & ERP Kuliner",
				Description: "Mengembangkan bisnis franchise makanan dengan merancang dan menggunakan sistem POS (Kasir Offline-First) serta sistem ERP buatan sendiri secara mandiri untuk efisiensi rantai pasok dan kasir multi-outlet.",
				Icon:        "ShoppingCart",
				ScaleBadge:  "POS & ERP Integration",
				Order:       7,
			},
			{
				Year:        "2025",
				Title:       "Kemitraan Strategis Sidomulyo Advertising",
				Subtitle:    "Transformasi Digital Percetakan & Advertising Enterprise",
				Description: "Resmi bekerja sama dengan Sidomulyo Advertising untuk merancang bangun sistem ERP terintegrasi khusus industri percetakan dan periklanan—mencakup kalkulasi otomatis HPP, stok bahan, dan keuangan real-time.",
				Icon:        "Building2",
				ScaleBadge:  "Enterprise Partnership",
				Order:       8,
			},
			{
				Year:        "2026",
				Title:       "Peluncuran Agensi Web & Software Developer RAMS",
				Subtitle:    "Solusi Perangkat Lunak Presisi & Terjangkau Untuk Masyarakat",
				Description: "Resmi membuka agency web & software development PT. Ragam Manfaat Sinergi untuk membantu seluruh lapisan masyarakat dan pelaku usaha yang terkendala biaya aplikasi berlangganan yang mahal serta software kustom yang tidak sesuai kebutuhan.",
				Icon:        "Layers",
				ScaleBadge:  "Full Scale Agency",
				Order:       9,
			},
		}
		for _, m := range milestones {
			database.Create(&m)
		}
		log.Println("✅ Milestones 2018-2026 seeded successfully")
	}

	// 2. Seed Services
	var serviceCount int64
	database.Model(&models.Service{}).Count(&serviceCount)
	if serviceCount == 0 {
		services := []models.Service{
			{
				Title:       "Pengembangan Sistem ERP",
				Subtitle:    "Enterprise Resource Planning",
				Description: "Solusi terintegrasi untuk manufaktur, percetakan, akuntansi, inventoris, dan operasional skala besar.",
				Icon:        "Layers",
				Category:    "Enterprise",
				Features:    "Multi-Tenant Architecture|Real-time Accounting & Tax|Smart Inventory Tracking|Automated Invoicing & Payroll",
				TechStack:   "Golang, Next.js, PostgreSQL, Redis",
				Order:       1,
			},
			{
				Title:       "Offline-First POS System",
				Subtitle:    "Point of Sale & Retail Automation",
				Description: "Sistem kasir cerdas berkecepatan tinggi yang tetap beroperasi 100% tanpa koneksi internet dan melakukan auto-sync saat online.",
				Icon:        "ShoppingCart",
				Category:    "Retail",
				Features:    "Offline Transaction Buffer|Local SQLite Engine|Multi-Outlet Cloud Sync|Hardware Printer & Scanner Integration",
				TechStack:   "React Native, Expo, SQLite, Node.js",
				Order:       2,
			},
			{
				Title:       "Custom Software Development",
				Subtitle:    "Tailored High-Performance System",
				Description: "Rancang bangun aplikasi web dan mobile sesuai alur kerja spesifik bisnis untuk efisiensi maksimum.",
				Icon:        "Code2",
				Category:    "Custom",
				Features:    "Clean Architecture Codebase|Scalable Microservices|RESTful & GraphQL API|High Availability Deployment",
				TechStack:   "Next.js, Golang, Python, Docker",
				Order:       3,
			},
		}
		for _, s := range services {
			database.Create(&s)
		}
		log.Println("✅ Services seeded successfully")
	}

	// 3. Seed Solution Blueprints for Simulator (Complete Matrix for Retail, Enterprise, Ticketing, Logistics, Custom)
	var blueprintCount int64
	database.Model(&models.SolutionBlueprint{}).Count(&blueprintCount)
	if blueprintCount == 0 {
		blueprints := []models.SolutionBlueprint{
			{
				IndustryKey:     "retail",
				ScaleKey:        "medium",
				Title:           "Offline-First POS & Retail Multi-Outlet Network",
				RecommendedArch: "SQLite Local Transaction Engine + Sync Gateway Worker + Central Cloud PostgreSQL",
				TechStack:       "React Native, Expo, SQLite Local Buffer, Golang REST API, Redis, Docker",
				Features:        "Offline transaction buffer, auto-sync backoff, multi-outlet stock tracking, Bluetooth receipt printing",
				EstimatedImpact: "100% uptime kasir tanpa mati transaksi saat internet terputus, akurasi stok otomatis 99%",
			},
			{
				IndustryKey:     "retail",
				ScaleKey:        "enterprise",
				Title:           "Enterprise High-Throughput Retail POS & Automated Supply Chain",
				RecommendedArch: "Distributed SQLite Nodes + Nginx Load Balancer + Event-Driven Kafka + Cloud PostgreSQL Cluster",
				TechStack:       "React Native, SQLite Engine, Golang Microservices, Apache Kafka, PostgreSQL Active-Standby",
				Features:        "Multi-store warehouse sync, automated purchase orders, central pricing dispatch, real-time sales telemetry",
				EstimatedImpact: "Skalabilitas 500+ outlet retail bersamaan, rekonsiliasi data inventoris nasional dalam 3 detik",
			},
			{
				IndustryKey:     "enterprise",
				ScaleKey:        "medium",
				Title:           "Modular ERP Printing & Manufacturing Automation",
				RecommendedArch: "Modular Monolithic Architecture + Isolated Tenant Schemas + Redis In-Memory Cache",
				TechStack:       "Next.js 14, Golang Clean Architecture, PostgreSQL, Redis, Nginx",
				Features:        "Kalkulasi otomatis HPP percetakan, Work Order live kanban, stok bahan baku otomatis, laporan keuangan real-time",
				EstimatedImpact: "Efisiensi kalkulasi HPP percetakan naik 85%, waktu penyusunan laporan keuangan berkurang dari 5 hari ke 10 detik",
			},
			{
				IndustryKey:     "enterprise",
				ScaleKey:        "enterprise",
				Title:           "Multi-Tenant Enterprise ERP Superapp & Financial Audit Engine",
				RecommendedArch: "Microservices API Gateway + Isolated Tenant DBs + Active-Active Database Cluster + Distributed Redis Cache",
				TechStack:       "Next.js 14, Golang Microservices, PostgreSQL Active-Active Cluster, Apache Kafka, Redis, Docker, Kubernetes",
				Features:        "Multi-company consolidation, real-time HPP & WIP tracking, automated tax & e-Faktur compliance, multi-currency ledger",
				EstimatedImpact: "Audit finansial real-time 100% terverifikasi, penghematan biaya operasional manufaktur hingga 35%",
			},
			{
				IndustryKey:     "ticketing",
				ScaleKey:        "medium",
				Title:           "Automated Event Ticketing & Gate Access System",
				RecommendedArch: "Queue Waiting Room + Redis Worker Engine + QR Offline Gate Validator",
				TechStack:       "Next.js, Golang Engine, Redis Queue, PostgreSQL",
				Features:        "Rate limiting ticket buffer, dynamic encrypted QR validation, anti-duplikasi tiket, live gate counter",
				EstimatedImpact: "Zero crash saat war ticket masal, validasi gate masuk <0.5 detik/pengunjung",
			},
			{
				IndustryKey:     "ticketing",
				ScaleKey:        "enterprise",
				Title:           "High-Throughput Stadium & National Event Ticketing Infrastructure",
				RecommendedArch: "Distributed Token Queue + Multi-Region Redis Cluster + Real-time Gate Analytics",
				TechStack:       "Next.js, Golang High-Throughput Microservices, Redis Cluster, WebSockets, PostgreSQL Active-Standby",
				Features:        "Throughput 150.000 TPS, multi-gate sync, seat map locking, auto-refund queue",
				EstimatedImpact: "Kapasitas 150.000 TPS tanpa kelambatan, 100% validasi tiket stadion nasional",
			},
			{
				IndustryKey:     "logistics",
				ScaleKey:        "medium",
				Title:           "Smart Logistics Fleet Tracking & Automated Dispatch",
				RecommendedArch: "IoT Telematics Ingestion Pipeline + Geospatial Indexing + Driver Mobile App",
				TechStack:       "Golang IoT Ingestion Engine, PostGIS / PostgreSQL, Flutter / React Native, Redis",
				Features:        "Live GPS fleet tracking, geofencing alert, fuel consumption analytics, digital Proof of Delivery",
				EstimatedImpact: "Efisiensi rute armada 25%, akurasi pengiriman tepat waktu naik hingga 98%",
			},
			{
				IndustryKey:     "logistics",
				ScaleKey:        "enterprise",
				Title:           "Enterprise Logistics Network & Automated Warehouse WMS",
				RecommendedArch: "Distributed IoT Telematics + Kafka Event Bus + WMS Warehouse Engine",
				TechStack:       "Golang Microservices, Apache Kafka, PostGIS, React Native, Kubernetes",
				Features:        "Cross-docking automation, barcode scanner dispatch, route optimization AI, real-time SLA monitor",
				EstimatedImpact: "Penghematan biaya bahan bakar armada 30%, akurasi inventoris gudang 99.8%",
			},
			{
				IndustryKey:     "custom",
				ScaleKey:        "medium",
				Title:           "Custom High Availability Software Architecture",
				RecommendedArch: "Clean Architecture Modular System + REST/GraphQL Gateway + Redis Cache",
				TechStack:       "Next.js, Golang, Python, PostgreSQL, Redis",
				Features:        "Clean Architecture codebase, role-based access control, automated CI/CD pipeline, real-time telemetry",
				EstimatedImpact: "Skalabilitas tinggi dengan SLA Uptime 99.99% dan maintenance terukur",
			},
			{
				IndustryKey:     "custom",
				ScaleKey:        "enterprise",
				Title:           "Enterprise Microservices Ecosystem & High-Security Gateway",
				RecommendedArch: "Kubernetes Microservices Mesh + Distributed DB Sharding + Zero-Trust Auth",
				TechStack:       "Next.js, Golang, Python, PostgreSQL Sharded, Kafka, Redis, Kubernetes",
				Features:        "Zero-trust OAuth2/JWT security, automated failover, load balancing, audit log compliance",
				EstimatedImpact: "Zero single point of failure, kesiapan skalabilitas hingga jutaan transaksi harian",
			},
		}
		for _, b := range blueprints {
			database.Create(&b)
		}
		log.Println("✅ Solution Blueprints seeded successfully")
	}

	// 4. Seed Live Development Projects (Superapp & TixNova Concert Ticketing)
	var liveProjCount int64
	database.Model(&models.LiveDevelopmentProject{}).Count(&liveProjCount)
	if liveProjCount == 0 {
		liveProjects := []models.LiveDevelopmentProject{
			{
				Title:       "EKOSISTEM SUPERAPP MULTI TENAN ERP",
				Slug:        "ekosistem-superapp-multi-tenant-erp",
				Category:    "Enterprise Superapp",
				Status:      "Development & Staging Active",
				Progress:    85,
				TargetDate:  "Q3 2026",
				Client:      "PT. RAMS Enterprise Ecosystem",
				Description: "Topologi arsitektur sistem RAMS terintegrasi real-time antara ERP, POS, Marketplace, HR, Gudang, dan Akuntansi dengan penanda modul LIVE & IN PROGRESS.",
				NodesJSON: `[
					{"id": "rams-tech", "name": "RAMS TECH", "subtitle": "Platform Tenant Ekosistem", "type": "root", "status": "LIVE", "badge": "Core Hub"},
					{"id": "sifin", "name": "SIFIN", "subtitle": "Accounting (Admin Panel)", "type": "core", "status": "LIVE", "parentId": "rams-tech", "badge": "Real-time Ledger"},
					{"id": "sidra", "name": "SIDRA", "subtitle": "Enterprise Resource Planning", "type": "core", "status": "LIVE", "parentId": "rams-tech", "badge": "ERP Engine"},
					{"id": "sigud", "name": "SIGUD", "subtitle": "Management Gudang (Admin Panel)", "type": "core", "status": "LIVE", "parentId": "rams-tech", "badge": "Stock Engine"},
					{"id": "sipos", "name": "SIPOS", "subtitle": "Aplikasi Pos Cashier", "type": "app", "status": "LIVE", "parentId": "sidra", "badge": "Offline-First"},
					{"id": "sihar", "name": "SIHAR", "subtitle": "Aplikasi Human Resource", "type": "app", "status": "IN_PROGRESS", "parentId": "sidra", "badge": "Testing Staging"},
					{"id": "siweb", "name": "SIWEB", "subtitle": "Aplikasi Web Porto (Admin)", "type": "app", "status": "LIVE", "parentId": "sidra", "badge": "CMS Portal"},
					{"id": "simar", "name": "SIMAR", "subtitle": "Aplikasi Marketplace (Admin)", "type": "app", "status": "IN_PROGRESS", "parentId": "sidra", "badge": "Sprint Build"},
					{"id": "sihub", "name": "SIHUB", "subtitle": "Aplikasi CRM (Admin Panel)", "type": "app", "status": "LIVE", "parentId": "sidra", "badge": "WA Cloud Bot"}
				]`,
			},
			{
				Title:       "TIXNOVA CONCERT TICKETING SAAS PLATFORM",
				Slug:        "tixnova-concert-ticketing-saas-platform",
				Category:    "Event & High-Throughput Ticketing",
				Status:      "Production Ready & Active Scaling",
				Progress:    92,
				TargetDate:  "Active 2026",
				Client:      "TixNova Concert & Event Infrastructure",
				Description: "Arsitektur platform ticketing konser SaaS multi-tenant dengan Nginx Load Balancer, Laravel 12 API, Redis Waiting Room 150.000 TPS, Payment Gateway, QR Scanner Gate, Interactive Seat Map, dan Web3 NFT Tickets.",
				NodesJSON: `[
					{"id": "tixnova-gateway", "name": "TIXNOVA GATEWAY", "subtitle": "Nginx SSL & Load Balancer", "type": "root", "status": "LIVE", "badge": "Phase 1 - Ingress Hub"},
					{"id": "tixnova-api", "name": "LARAVEL 12 API", "subtitle": "Sanctum Auth & Core Logic", "type": "core", "status": "LIVE", "parentId": "tixnova-gateway", "badge": "Phase 1 - REST Engine"},
					{"id": "tixnova-redis", "name": "REDIS 7 QUEUE", "subtitle": "Waiting Room (150k TPS)", "type": "core", "status": "LIVE", "parentId": "tixnova-gateway", "badge": "Phase 1 - Traffic Buffer"},
					{"id": "tixnova-db", "name": "MYSQL 8 CLUSTER", "subtitle": "MySQL / Postgres Data Core", "type": "core", "status": "LIVE", "parentId": "tixnova-api", "badge": "Phase 1 - ACID Storage"},
					{"id": "tixnova-worker", "name": "HORIZON WORKER", "subtitle": "Email & WA Notif Engine", "type": "core", "status": "LIVE", "parentId": "tixnova-redis", "badge": "Phase 2 - Mail & WA Queue"},
					{"id": "tixnova-pay", "name": "MIDTRANS & XENDIT", "subtitle": "Multi-Payment Auto-Settlement", "type": "app", "status": "LIVE", "parentId": "tixnova-api", "badge": "Phase 1 & 2 - Payment"},
					{"id": "tixnova-public", "name": "BUYER WEB PORTAL", "subtitle": "Next.js 14 War Ticket Site", "type": "app", "status": "LIVE", "parentId": "tixnova-api", "badge": "Phase 1 - Public Site"},
					{"id": "tixnova-promotor", "name": "PROMOTOR DASHBOARD", "subtitle": "Event & Ticket Inventory Admin", "type": "app", "status": "LIVE", "parentId": "tixnova-api", "badge": "Phase 1 - Tenant Admin"},
					{"id": "tixnova-scanner", "name": "QR GATE SCANNER", "subtitle": "PWA Concert Gate QR Validator", "type": "app", "status": "IN_PROGRESS", "parentId": "tixnova-api", "badge": "Phase 2 - Gate App"},
					{"id": "tixnova-vouchers", "name": "VOUCHER & DISCOUNTS", "subtitle": "Promo & Discount Engine", "type": "app", "status": "IN_PROGRESS", "parentId": "tixnova-api", "badge": "Phase 2 - Marketing"},
					{"id": "tixnova-seatmap", "name": "SEAT MAP BUILDER", "subtitle": "Interactive Seat Layout Engine", "type": "app", "status": "IN_PROGRESS", "parentId": "tixnova-api", "badge": "Phase 3 - Seat Selection"},
					{"id": "tixnova-affiliate", "name": "REFERRAL & AFFILIATE", "subtitle": "Commission & Referral Tracking", "type": "app", "status": "IN_PROGRESS", "parentId": "tixnova-api", "badge": "Phase 3 - Growth Engine"},
					{"id": "tixnova-refund", "name": "REFUND & RESCHEDULE", "subtitle": "Automated Refund Queue Engine", "type": "app", "status": "IN_PROGRESS", "parentId": "tixnova-api", "badge": "Phase 3 - Ticket Policy"},
					{"id": "tixnova-nft", "name": "NFT WEB3 TICKETS", "subtitle": "Blockchain Ticket Authentication", "type": "app", "status": "IN_PROGRESS", "parentId": "tixnova-api", "badge": "Phase 4 - Web3 Scale"},
					{"id": "tixnova-resale", "name": "TICKET RESALE MARKET", "subtitle": "Verified Secondary Ticket Market", "type": "app", "status": "IN_PROGRESS", "parentId": "tixnova-api", "badge": "Phase 4 - Resale Market"},
					{"id": "tixnova-b2b", "name": "B2B CORPORATE API", "subtitle": "Open Enterprise API Gateway", "type": "app", "status": "IN_PROGRESS", "parentId": "tixnova-api", "badge": "Phase 4 - Open API"}
				]`,
			},
		}
		for _, lp := range liveProjects {
			database.Create(&lp)
		}
		log.Println("✅ Live Projects (Superapp & TixNova) seeded successfully")
	}
}
