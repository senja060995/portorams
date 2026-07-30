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
- **Login URL**: `http://localhost:3000/admin/login`
- **Default Username**: `admin`
- **Default Password**: `admin123`

---

*Developed with ❤️ by PT. Ragam Manfaat Sinergi (RAMS) • 2026*  
*Domain Resmi*: [https://rams.biz.id](https://rams.biz.id)
