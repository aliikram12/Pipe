# 🧊 AgriSupply ColdIQ Platform
### Smart Cold-Chain Logistics, Provenance & IoT Fleet Platform — Pakistan

---

## 📋 Table of Contents
1. [Platform Overview](#-platform-overview)
2. [Demo Credentials & User Roles](#-demo-credentials--user-roles)
3. [How Login & Role Selection Works](#-how-login--role-selection-works)
4. [Zero-Token Map Engine (Leaflet + OpenStreetMap)](#-zero-token-map-engine-leaflet--openstreetmap)
5. [JWT Authentication & Security Architecture](#-jwt-authentication--security-architecture)
6. [Core Modules & Features](#-core-modules--features)
7. [Tech Stack](#-tech-stack)
8. [Setup & Running Locally](#-setup--running-locally)
9. [API Endpoints Reference](#-api-endpoints-reference)

---

## 🌟 Platform Overview

**AgriSupply ColdIQ** is an enterprise-grade agricultural cold-chain logistics and provenance platform built for Pakistan's multi-billion rupee perishable produce sector (Kinnow Mandarin from Sargodha, Chaunsa Mangoes from Multan, Mozika Seed Potatoes from Okara, and Alpine Cherries from Swat).

The system integrates:
- **Zero-Token Interactive Live GPS Maps** for the M-2 (Sargodha → Lahore) and M-5 (Multan → Sukkur → Karachi Port Qasim) transit corridors.
- **Continuous IoT Reefer & Cold Chamber Telemetry** with automated temperature breach alerts (> 8°C or < 0°C).
- **Role-Based Access Control (RBAC)** across 5 agricultural stakeholder personas.
- **Enterprise JWT Dual-Token Authentication** with automatic refresh rotation and secure HTTP-only cookies.
- **Offline-First Resilience** with IndexedDB mutation queueing and automated cloud synchronization.

---

## 🔑 Demo Credentials & User Roles

You can log in as any of the **5 agricultural stakeholders**. All accounts share the same password for ease of evaluation.

| # | Role | Stakeholder Title | Demo Name | Email (Username) | Password | Key Permissions & Responsibilities |
|---|------|-------------------|-----------|------------------|----------|------------------------------------|
| **1** | `FARMER` | **Producer / Farmer** | Chaudhry Tariq Mehmood | `farmer@demo.com` | `Password123!` | Harvest batch registration, QR code generation, crop yield tracking (Bhalwal Citrus Orchards) |
| **2** | `TRANSPORTER` | **NLC Fleet Transporter** | Asif Mahmood (NLC) | `transporter@demo.com` | `Password123!` | Live GPS dispatch, Reefer truck telemetry, M-2 / M-5 geofencing & speed monitoring |
| **3** | `WAREHOUSE_ADMIN` | **Cold Hub Manager** | Haji Bashir Gujjar | `warehouse@demo.com` | `Password123!` | Lahore Central Cold-Chain Hub, IoT chamber thresholds, stock intake & dispatch |
| **4** | `RETAILER` | **Retailer & Buyer** | Zubair Qureshi (Imtiaz) | `retailer@demo.com` | `Password123!` | Imtiaz Supermarket produce orders, PKR invoicing, cold-chain provenance verification |
| **5** | `SUPER_ADMIN` | **System Super Admin** | Malik Farooq Ahmad | `admin@demo.com` | `Password123!` | Full enterprise governance, tenant management, immutable audit logs & quality approvals |

---

## 🚀 How Login & Role Selection Works

The login interface at `/login` provides a guided workflow:

```
[ Step 1: Select Role at Top ]
       ↓
[ Step 2: View Role Credentials Card with 1-Click Copy / Fill ]
       ↓
[ Step 3: Enter or Auto-Fill Email & Password in Form ]
       ↓
[ Step 4: Click 'Sign In' → JWT Dual-Token Generated → Redirect to Dashboard ]
```

### Detailed Workflow:
1. **Inputs are Empty by Default**: Username and password fields start blank (no forced auto-fill).
2. **Top Role Selector Tabs**: Click on any persona (e.g. *NLC Fleet Transporter* or *Producer / Farmer*).
3. **Role Credentials Card**:
   - Displays the selected persona's title, demo user name, and permissions.
   - **Copy Email Button** 📋: Instantly copies `transporter@demo.com` to your clipboard.
   - **Copy Password Button** 📋: Instantly copies `Password123!` to your clipboard.
   - **"Fill into Login Form" Button** ✨: One click populates the Email and Password input fields with the selected role's credentials.
4. **Sign In**: Click **"Sign In to ColdIQ Platform"**. The backend verifies the bcrypt password hash against PostgreSQL, issues JWT tokens, sets secure cookies, and redirects you to the dashboard.
5. **In-App Role Switcher**: After logging in, you can switch between all 5 roles using the **"Role: [Current Role]"** dropdown in the top header without signing out.

---

## 🗺️ Zero-Token Map Engine (Leaflet + OpenStreetMap)

### Problem Solved
Previously, the tracking system displayed:
> `Map Token Required: Add NEXT_PUBLIC_MAPBOX_TOKEN to .env`

This blocked users when Mapbox tokens were missing, invalid, or expired.

### Solution Implemented
The map component ([`components/map/live-tracking-map.tsx`](file:///d:/Pipe/components/map/live-tracking-map.tsx)) now uses a **Leaflet engine** powered by **CartoDB Voyager** and **OpenStreetMap**:

- **100% Free & Zero-Token**: Requires **no API key** or token in `.env`. Works out of the box anywhere.
- **Pakistan Corridor Map Tiles**: High-contrast, high-resolution raster tiles detailing Pakistani highways, motorways (M-2, M-5, N-5), and major transit nodes (Lahore, Multan, Sargodha, Karachi Port Qasim, Okara, Swat).
- **Custom HTML Teardrop Markers**:
  - 🚛 **Fleet Vehicles**: Dark navy teardrop pins with vehicle emojis. If temperature breaches safety limits (< 0°C or > 8°C), the pin pulses with a prominent red ripple animation (`pulse-ring`).
  - 🏭 **Cold Storage Hubs**: Sky blue pins for distribution hubs and marine export terminals.
  - 🌾 **Farms**: Emerald green pins for orchards and production centers.
- **Interactive Route Trails**: Renders active shipment paths with glowing blue polyline corridors.
- **Geofence Perimeters**: Visualizes circular geofence areas (e.g., Lahore Hub 2.5km radius, Bhalwal Packing Gate 1.8km radius) with dashed boundaries and hover tooltips.
- **Interactive Controls**:
  - Zoom In (`+`), Zoom Out (`-`), and Bounds Fit (`Maximize2`).
  - Toggle checkboxes for **Geofences** and **Routes**.
  - Style switch between **Carto Voyager** and **OpenStreetMap**.

---

## 🔒 JWT Authentication & Security Architecture

The platform uses an enterprise **Dual-Token Rotation** pattern:

### 1. Token Lifecycles
- **Access Token (`agri_access_token`)**:
  - Signed with `JWT_SECRET`.
  - Valid for **1 day (24 hours)**.
  - Carries user identity, role, tenant ID, and tenant name.
- **Refresh Token (`agri_refresh_token`)**:
  - Signed with `JWT_REFRESH_SECRET`.
  - Valid for **7 days**.
  - Used to transparently reissue expired access tokens.

### 2. Dual Delivery Mechanism
- **HTTP-Only Cookies**: Automatically set on login (`SameSite: lax`, `path: /`, `httpOnly: true`). Secure against client-side XSS extraction.
- **Bearer Authorization Header**: Returned in the login response payload for client-side API fetches and WebSocket handshakes (`Authorization: Bearer <token>`).

### 3. Edge Route Middleware ([`middleware.ts`](file:///d:/Pipe/middleware.ts))
- Protects all core routes (`/`, `/tracking`, `/shipments`, `/inventory`, `/orders`, `/quality`, `/batches`, `/audit`, `/settings`).
- Redirects unauthenticated visitors to `/login?from=<path>`.
- Redirects logged-in users visiting `/login` directly to `/`.

### 4. Automatic Token Refresh ([`hooks/use-api-client.ts`](file:///d:/Pipe/hooks/use-api-client.ts))
- Intercepts any `401 Unauthorized` API responses.
- Automatically contacts `/api/auth/refresh` to rotate tokens without interrupting the user.
- Re-executes the failed request seamlessly.

---

## 📦 Core Modules & Features

### 1. Central Executive Dashboard (`/`)
- Real-time KPI summaries: Total Produce Batches, Active In-Transit Fleet, Cold Hub Utilization, and Total PKR Revenue.
- Embedded interactive Pakistan Live Fleet Map.
- Live IoT Temperature & Humidity streaming chart with threshold danger lines.
- Real-time Lahore weather widget with cold-chain transit advisory.

### 2. Batch Management & QR Traceability (`/batches` & `/batches/[id]`)
- Produce registration (Kinnow Mandarin, White Chaunsa Mango, Mozika Seed Potatoes, Royal Red Cherries, Super Kernel Basmati).
- QR code generation for field crates and export cartons.
- Shelf-life calculation and harvest date tracking.

### 3. Fleet GPS & Telemetry Tracking (`/tracking`)
- Full-screen interactive map with M-2 (Sargodha → Lahore) and M-5 (Multan → Karachi) corridors.
- Vehicle telemetry sidebar displaying reefer temperature, GPS speed, driver name, and geofence status.
- One-click focus on specific vehicles or cold storage facilities.

### 4. Cold Shipments (`/shipments` & `/shipments/[id]`)
- Dispatch manifest with origin farm, destination warehouse, driver assigned, and payload quantity.
- Live breadcrumb trails and milestone status updates (*PLANNED*, *IN_TRANSIT*, *DELIVERED*).

### 5. Quality Inspection (`/quality`)
- Quality officer scoring: Grade A, Grade B, Grade C, or Rejected.
- Brix sweetness rating, pulp temperature, ethylene levels, and GlobalGAP compliance logs.

### 6. B2B Marketplace & PKR Invoicing (`/orders`)
- Orders placed by commercial buyers (e.g. Imtiaz Supermarket, Metro Cash & Carry, Utility Stores).
- Automated PKR invoice generation, tax computation, and payment status tracking.

### 7. Audit Logging (`/audit`)
- Immutable audit trail recording every user login, batch registration, temperature excursion, and status transition.
- Captured with timestamp, user ID, IP address, and payload delta.

### 8. Offline-First Resilience
- Built with Dexie.js (IndexedDB).
- Testable via the **"Simulate Offline"** button in the header.
- Actions performed while offline are held in a local queue and synced to PostgreSQL upon reconnecting.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Components & Route Handlers)
- **Language**: TypeScript 5.6
- **Database**: PostgreSQL (Hosted on Neon AWS Serverless)
- **ORM**: [Prisma 5.21](https://www.prisma.io/)
- **Mapping**: [Leaflet 1.9](https://leafletjs.com/) + OpenStreetMap & CartoDB Voyager tiles
- **Authentication**: JWT (`jsonwebtoken`) + `bcryptjs` + HTTP-Only Cookies
- **State Management**: [Zustand 5.0](https://zustand-demo.pmnd.rs/) with LocalStorage persistence
- **Styling**: Tailwind CSS + Custom Neumorphic System + CSS Tokens
- **Icons**: Lucide React
- **Notifications**: Sonner Toasts + Custom Notification Center
- **Charts**: Recharts
- **PDF & Reports**: jsPDF + jsPDF-AutoTable

---

## 💻 Setup & Running Locally

### 1. Prerequisites
- Node.js 18.x or 20.x
- npm or yarn

### 2. Environment Variables (`.env`)
The database and JWT configuration is pre-configured in `.env`:

```env
# Database configuration (Neon PostgreSQL with connection timeout)
DATABASE_URL="postgresql://neondb_owner:npg_zCjfX6pDQ7EM@ep-dawn-silence-b58fom4m-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&connect_timeout=30"
DIRECT_URL="postgresql://neondb_owner:npg_zCjfX6pDQ7EM@ep-dawn-silence-b58fom4m.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&connect_timeout=30"

# JWT Secrets
JWT_SECRET="agrisupply-production-jwt-access-secret-key-xyz-2026"
JWT_REFRESH_SECRET="agrisupply-production-jwt-refresh-secret-key-xyz-2026"

# App URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="/api"
NEXT_PUBLIC_MAP_API_URL="https://nominatim.openstreetmap.org"

# Weather API Key
NEXT_PUBLIC_WEATHER_API_KEY="XjuP$d$Ba9qgERh"
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Seed Database (Optional)
If you ever need to reset the demo dataset:
```bash
npm run db:push
npm run db:seed
```

### 5. Run Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### 6. Build for Production
```bash
npm run build
npm run start
```

---

## 📡 API Endpoints Reference

### Authentication
- `POST /api/auth/login` — Authenticate with email & password, return JWT tokens, set cookies.
- `POST /api/auth/logout` — Terminate session and clear HTTP-only cookies.
- `POST /api/auth/refresh` — Refresh access token using refresh token cookie or body.
- `GET /api/auth/me` — Verify token and return current authenticated user profile.

### Core Resources
- `GET /api/dashboard` — Live KPI metrics, produce distribution, and telemetry alerts.
- `GET /api/batches` | `POST /api/batches` — Produce batches CRUD.
- `GET /api/shipments` | `POST /api/shipments` — Cold-chain shipments management.
- `GET /api/vehicles` — Vehicle fleet status and coordinates.
- `GET /api/warehouses` — Cold storage hubs and IoT sensor chambers.
- `GET /api/sensors` — Real-time telemetry readings and excursion alerts.
- `GET /api/orders` | `POST /api/orders` — B2B purchase orders and invoicing.
- `GET /api/audit-logs` — Immutable audit log feed.

---

## 👥 Summary of Completed Improvements

1. ✅ **Form Inputs Do Not Auto-Fill Directly**: Inputs start completely empty; users select a persona from the top bar to inspect credentials and can either type them or click *Fill into Login Form*.
2. ✅ **Eliminated "Map Token Required" Error**: Migrated live map to Leaflet with CartoDB Voyager and OpenStreetMap. Free, reliable, and zero token required.
3. ✅ **Full JWT Dual-Token Authentication**: Secure access + refresh token rotation with HTTP-only cookies, middleware protection, and `/api/auth/me` verification.
4. ✅ **Neon PostgreSQL Cold-Start Fixed**: Added `&connect_timeout=30` to connection strings to handle serverless compute wakeups smoothly.
5. ✅ **Production Build Verified**: Next.js 14 production bundle compiles 100% cleanly across all 32 pages and dynamic routes.
