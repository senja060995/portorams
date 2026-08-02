# PT. Ragam Manfaat Sinergi (RAMS) - Executive Developer Portfolio & CMS Platform

Official repository for **PT. Ragam Manfaat Sinergi (RAMS)** executive developer portfolio, solution simulator, multi-tenant live topology visualizer, and built-in CMS command center.

---

## 🚀 Tech Stack

### Frontend Architecture
- **Framework**: Next.js 14 (App Router)
- **Styling**: Vanilla CSS Design Tokens, Glassmorphism, Tailwind CSS
- **3D Graphics**: WebGL 3D Interactive Globe (`cobe`)
- **Animations**: Motion & Framer Motion
- **Icons**: Lucide React

### Backend Architecture
- **Language & Framework**: Golang (Clean Architecture) + Gin Gonic Framework
- **ORM & Drivers**: GORM with Dual-Driver support (PostgreSQL & SQLite)
- **Security**: JWT Authentication & BCrypt Hashing
- **Database**: PostgreSQL (Production) / SQLite (Development Fallback)

---

## 📂 Project Structure

```text
portofoliorams/
├── backend/
│   ├── controllers/      # REST API Handlers
│   ├── db/               # Database Seeder & Auto Migration
│   ├── middleware/       # JWT Auth Middleware
│   ├── models/           # GORM Struct Schemas
│   ├── .env              # Environment Configuration
│   ├── main.go           # Entry point
│   └── server            # Built binary
└── frontend/
    ├── public/           # Static Assets & Logo Images
    ├── src/
    │   ├── app/          # Next.js App Router Pages
    │   ├── components/   # UI Components (3D Globe, Live Topology, Simulator, etc.)
    │   └── utils/        # Cyber SFX Sound Effects
    └── .env.local        # Frontend Environment Variables
```

---

## 🛠️ Quick Start & Local Setup

### 1. Run Golang REST API Backend
```bash
cd backend
go run main.go
# API Server runs at http://localhost:8080
```

### 2. Run Next.js Frontend
```bash
cd frontend
npm install
npm run dev
# Web app runs at http://localhost:3000
```

---

## 🔐 CMS Admin Access

The CMS is **wallet-only** — no username or password exists. Only Ethereum wallets listed in the allowlist can sign in, and every login attempt is recorded in an audit log.

### Login URL
- `http://localhost:3000/admin/login`

### 1. Prepare MetaMask
Install the MetaMask extension, unlock it, and switch the active network to **Ethereum mainnet** (Chain ID 1).

### 2. Add a wallet to the allowlist
The first admin wallet is seeded from the `ALLOWED_WALLETS` environment variable on first boot (see `backend/.env.example`). Further wallets can be added by an existing **admin** from the **Wallet Akses** page inside the CMS.

```env
# backend/.env
ALLOWED_WALLETS=0x3A355a346EC5c0Cce3c82D49B3C854c1815C259E:admin
SIWE_DOMAIN=localhost:3000
SIWE_URI=http://localhost:3000
```

> **Production note**: set `SIWE_DOMAIN` and `SIWE_URI` to the public origin (e.g. `rams.biz.id` / `https://rams.biz.id`), and `JWT_SECRET` to a long random value. Never commit `.env` files.

### 3. Sign in
1. Open the login page and click **Hubungkan MetaMask**.
2. Confirm the connection, then review the signing request (a signature, not a transaction — no gas is spent).
3. Sign to finish. The session lives in `sessionStorage`, expires server-side after 1 hour of activity or 30 minutes idle, and is revoked if the wallet switches accounts or networks.

### Security model
- Signatures verified server-side with EIP-191/`personal_sign` recovery and EIP-55 checksum validation; nonces are single-use and expire after 5 minutes.
- Wallet allowlist stored in the database; deactivating or deleting a wallet immediately revokes its sessions.
- Failed login attempts are rate-limited and locked out per address/IP.
- Password login is disabled by default (`ENABLE_PASSWORD_LOGIN=false`).

---

## 💬 Customer Service Chat

A floating chat widget is available on every public page. It is a real customer-service bot, not a canned FAQ: when `AI_API_KEY` is set it answers through an OpenAI-compatible provider (default: Groq) using a persona that speaks naturally like a human (no "I am an AI" disclaimers, short answers, in the visitor's language). Without a key it gracefully falls back to a keyword bot.

```env
# backend/.env
AI_BASE_URL=https://api.groq.com/openai/v1   # any OpenAI-compatible endpoint
AI_API_KEY=gsk_...                            # leave empty to use the keyword bot
AI_MODEL=llama-3.3-70b-versatile
```

Rules that always hold, regardless of engine:
- Pricing questions **never** get a made-up number. A prominent **WhatsApp** button is shown instead, pre-filled with a message, so the visitor reaches a human (the target number is the `whatsapp` site setting).
- The reply streams to the widget and is rendered with a human typing effect.
- The system prompt is grounded in the site settings (company name, services, WhatsApp/email/phone) and never advertises itself as AI.

---

*Developed with ❤️ by PT. Ragam Manfaat Sinergi (RAMS) • 2026*  
*Domain Resmi*: [https://rams.biz.id](https://rams.biz.id)
