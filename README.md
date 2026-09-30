# 🧊 AgriSupply ColdIQ Platform

> **Smart Cold-Chain Logistics & Agricultural Provenance Platform**

A production-grade, full-stack supply chain management platform designed for Pakistan's agricultural ecosystem. Built with Next.js 14, Prisma, PostgreSQL, Mapbox GL, and real-time IoT telemetry.

---

## 🌟 Key Features

### 🚜 Multi-Role RBAC System
- **Farmer / Producer** — Harvest batch registration, QR generation & yield tracking
- **Transporter (NLC Fleet)** — Live GPS dispatch, reefer telemetry & M-2/M-5 geofencing
- **Warehouse Admin** — Lahore Cold-Chain Hub chamber control, IoT thresholds & batch intake
- **Retailer (Imtiaz)** — Produce procurement, cold-chain provenance & PKR invoicing

### 📊 Real-Time Dashboard
- KPI cards with live metrics (batches, shipments, cold storage, alerts)
- Interactive telemetry charts with temperature & humidity streaming
- Weather widget with cold-chain impact assessment
- Simulated IoT temperature excursion triggers

### 🗺️ Fleet GPS & Live Tracking
- **Mapbox GL JS** powered professional map with custom markers
- Real-time vehicle tracking with temperature overlay
- Geofence zones (warehouse, farm, checkpoint) visualization
- Route trail polylines for shipment path history

### 🌡️ IoT Cold-Chain Monitoring
- Multi-sensor dashboard (temperature, humidity, ethylene, door sensors)
- Real-time telemetry charts with threshold alerts
- Temperature excursion detection & auto-notifications
- Cold storage chamber management (capacity, status, sensor health)

### 📦 Supply Chain Management
- **Produce Batches** — Full lifecycle from harvest to delivery with quality grades
- **Cold Shipments** — Planned, in-transit, delivered status with GPS tracking
- **Quality Inspection** — Grade A/B/C classification, contamination checks
- **Marketplace Orders** — Multi-item procurement with PKR invoicing

### 🔔 Real-Time Notifications
- Slide-out notification center with priority filters
- Critical/Warning/Info alert classification
- WebSocket + smart polling fallback for Vercel deployment
- IoT temperature breach auto-alerts

### 📱 Responsive Design
- Fully responsive for desktop, tablet, and mobile screens
- Collapsible sidebar with mobile hamburger menu
- Touch-optimized interactions

### 🌐 Offline-First Architecture
- IndexedDB (Dexie.js) queue for offline mutations
- Automatic sync when connection restores
- Simulated offline mode toggle for testing

### 📈 Analytics & Reporting
- Supply chain analytics with interactive charts (Recharts)
- PDF export (jsPDF + AutoTable)
- CSV data export
- Audit trail with user action logging

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 3 + Custom CSS Design System |
| **Database** | PostgreSQL (Neon / Supabase / Vercel Postgres) |
| **ORM** | Prisma 5 |
| **State** | Zustand 5 |
| **Data Fetching** | TanStack React Query + SWR patterns |
| **Maps** | Mapbox GL JS |
| **Charts** | Recharts |
| **Weather** | WeatherAPI.com |
| **Auth** | JWT (Access + Refresh Token Rotation) |
| **Offline** | Dexie.js (IndexedDB) |
| **PDF** | jsPDF + AutoTable |
| **Icons** | Lucide React |
| **Notifications** | Sonner (Toast) + Custom Panel |
| **Drag & Drop** | dnd-kit |
| **Forms** | React Hook Form + Zod |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (recommended: [Neon](https://neon.tech) for free tier)

### Installation

```bash
# Clone the repository
git clone https://github.com/aliikram12/Pipe.git
cd Pipe

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your database URL, API keys, etc.

# Generate Prisma client & push schema
npx prisma generate
npx prisma db push

# Seed demo data (optional)
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the platform.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string (pooled) |
| `DIRECT_URL` | ✅ | PostgreSQL direct connection string |
| `JWT_SECRET` | ✅ | JWT access token secret |
| `JWT_REFRESH_SECRET` | ✅ | JWT refresh token secret |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | ⭐ | Mapbox GL JS public token (for maps) |
| `NEXT_PUBLIC_WEATHER_API_KEY` | ⭐ | WeatherAPI.com key (for weather widget) |

---

## 📂 Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/                # API routes (auth, batches, shipments, etc.)
│   ├── analytics/          # Analytics & reports page
│   ├── batches/            # Produce batch management
│   ├── inventory/          # Cold storage & warehouse management
│   ├── login/              # Authentication page
│   ├── orders/             # Marketplace orders
│   ├── quality/            # Quality inspection
│   ├── settings/           # Platform settings
│   ├── shipments/          # Cold shipment management
│   ├── tracking/           # Fleet GPS tracking
│   ├── globals.css         # Design system & global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Dashboard (home)
├── components/
│   ├── layout/             # Sidebar, Header, AppLayout
│   ├── map/                # Mapbox Live Tracking Map
│   ├── notifications/      # Notification center panel
│   ├── offline/            # Offline banner
│   ├── reports/            # PDF & CSV exporters
│   ├── sensors/            # Telemetry charts, weather widget
│   └── ui/                 # Shared UI components (Modal, StatusBadge)
├── hooks/                  # Custom hooks (API client, offline sync, realtime)
├── lib/                    # Utilities, auth, prisma client, types
├── prisma/                 # Prisma schema & seed script
├── stores/                 # Zustand stores (auth, notifications, offline)
└── public/                 # Static assets
```

---

## 🌐 Deployment (Vercel)

This project is optimized for **Vercel** deployment:

1. Push code to GitHub
2. Import repository in Vercel Dashboard
3. Add environment variables (DATABASE_URL, JWT_SECRET, etc.)
4. Deploy — Vercel auto-detects Next.js and runs `prisma generate && next build`

> **Note:** WebSocket server (`ws:server`) is not supported on Vercel's serverless platform. The app automatically falls back to smart polling (every 15 seconds) for real-time updates.

---

## 🔐 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Farmer | farmer@demo.com | Password123! |
| Transporter | transporter@demo.com | Password123! |
| Warehouse Admin | warehouse@demo.com | Password123! |
| Retailer | retailer@demo.com | Password123! |

---

## 📄 License

This project is proprietary and confidential.

---

**Built with ❤️ for Pakistan's Agricultural Supply Chain**
