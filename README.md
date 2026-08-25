# 🌾 AgriAssist

> **India's Premier Agricultural Digital Ecosystem**

AgriAssist is a comprehensive B2B/B2C SaaS platform designed to unite all stakeholders in the agricultural supply chain: Farmers, Buyers, Transporters, and Recycling Industries.

## 🚀 Key Features

* **Multi-Role Dashboards:** Distinct experiences for Farmers, Buyers, Transport, Industry, and Admins.
* **Smart Marketplace:** Direct crop and agricultural waste selling with negotiation and digital contracts.
* **Gemini AI Integration:** AI-powered disease detection, crop recommendations, and market intelligence.
* **Real-time Logistics:** GPS tracking for transport bookings and live order status via Socket.IO.
* **Weather & Schemes:** Hyper-local weather forecasting and automated Government scheme matching.
* **Premium UI:** Built with Next.js 15, Tailwind 4, Shadcn, and Framer Motion for a stunning glassmorphic experience.

## 🛠 Tech Stack

* **Monorepo:** Turborepo
* **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS 4, Zustand, React Hook Form, Framer Motion
* **Backend:** Node.js, Express.js, Socket.IO
* **Database:** MongoDB (Mongoose)
* **Services:** Google Gemini API, OpenWeather API, Google Maps, Supabase Storage, Twilio, Resend.

## 📦 Getting Started

### 1. Prerequisites
Ensure you have `node` (v20+) and `npm` installed.

### 2. Installation
Clone the repository and install dependencies from the root:
```bash
npm install
```

### 3. Environment Setup
Copy the example environment files and fill in your keys:
```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

### 4. Running Locally
Start the entire Turborepo stack (both frontend and backend) in development mode:
```bash
npm run dev
```
* **Frontend:** `http://localhost:3000`
* **Backend API:** `http://localhost:5000`

## 🛡 License
Proprietary / Closed Source. All rights reserved.
