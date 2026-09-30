# AgriSupply Chain & Smart Cold-Chain Logistics Platform 🚀

A highly professional, enterprise-grade Next.js application designed to manage, monitor, and optimize agricultural supply chains and cold-storage logistics in Pakistan (and globally).

## 🌟 Key Features

### 1. **Live GPS Fleet Tracking (Google Maps API)**
- Real-time vehicle telemetry using `@react-google-maps/api`.
- Built-in geofencing logic for cold-storage hubs and farms.
- Route trails and active temperature excursion alerts.

### 2. **Professional Modern UI (Tailwind CSS)**
- Crisp, high-contrast, professional corporate design (Slate, Emerald, Navy).
- Custom flat-design component library with elegant depth and micro-animations.
- Fully responsive across desktop, tablet, and mobile.

### 3. **Offline Resilience (IndexedDB)**
- "Offline Mode Simulation" built right into the header.
- Uses `dexie` to cache mutations locally when network drops.
- Automatic queue synchronization when connection is restored.

### 4. **Role-Based Access Control (RBAC)**
- Instant Role Switching (Super Admin, Warehouse Admin, Transporter, Farmer).
- Granular permissions and tailored dashboards based on the user's role.

### 5. **Robust Database & ORM (Neon PostgreSQL + Prisma)**
- Relational database schema with full referential integrity.
- Type-safe queries using Prisma Client.
- Ready for serverless scaling.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Custom Corporate Utility Classes (`globals.css`)
- **Database**: Neon Serverless PostgreSQL
- **ORM**: Prisma
- **Mapping**: Google Maps SDK (`@react-google-maps/api`)
- **State Management**: Zustand
- **Offline Storage**: IndexedDB / Dexie.js
- **Auth**: JWT-based session management

---

## 🚀 Local Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the root directory and add the following keys:
   ```env
   # PostgreSQL Connection (Neon)
   DATABASE_URL="postgresql://neondb_owner:npg_zCjfX6pDQ7EM@ep-dawn-silence-b58fom4m-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require"
   DIRECT_URL="postgresql://neondb_owner:npg_zCjfX6pDQ7EM@ep-dawn-silence-b58fom4m.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require"

   # Google Maps API Key for Live Tracking
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIzaSyDAcJPWyLLQMvWaQcWuc9neYM-geNYNIyY"
   
   # JWT Secret for Authentication
   JWT_SECRET="your-super-secret-key-change-in-production"
   ```

3. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   # Optional: Seed the database with demo data
   npm run db:seed
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## ☁️ Deploying to Vercel (Best Way)

This project is perfectly optimized for 1-click deployment on Vercel. 

### Steps for Vercel Deployment:
1. **Push your code to GitHub/GitLab/Bitbucket.**
2. **Go to Vercel Dashboard** and click **"Add New Project"**.
3. Import your repository.
4. **Environment Variables**: In the deployment settings, make sure to add the exact environment variables from your `.env` file:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - `JWT_SECRET`
5. **Build Command**: Vercel automatically detects Next.js. The `package.json` already has `"build": "prisma generate && next build"`, which ensures the Prisma client is built before Next.js compiles. **Do not change the build command**.
6. **Click Deploy**. 

Vercel will handle the rest, and your platform will be live globally on the Edge!

---

## 🏗️ Project Structure

- `/app` - Next.js App Router pages and API endpoints.
- `/components` - Reusable UI components (Layout, Maps, Offline, Notifications).
- `/lib` - Utilities, type definitions, and Prisma client instance.
- `/prisma` - Database schema (`schema.prisma`) and seeding scripts.
- `/stores` - Zustand global state stores (Auth, Offline Queue).
- `/server` - WebSocket server definitions (if running custom Node server).

## 🔒 Security Notes
- Ensure your `JWT_SECRET` is strong in production.
- For Google Maps, it is highly recommended to restrict your API Key in the Google Cloud Console to only allow requests from your specific Vercel production domain.

---
*Built for the future of Pakistan's Smart AgriSupply Ecosystem.* 🌾🚛🧊
