# AgriAssist Project Context

**Project Name:** AgriAssist (Farmer Digital Assistant)
**Objective:** Build a complete agricultural digital ecosystem where Farmers, Buyers, Transport Providers, Recycling Industries, and Admins work together on one intelligent platform. This is a production-ready SaaS platform suitable for real-world deployment.

---

## 1. Tech Stack
* **Monorepo:** Turborepo
* **Frontend:** Next.js 15 (App Router), React 19, TypeScript
* **Styling:** Tailwind CSS 4, Shadcn UI (customized), Framer Motion, Glassmorphism
* **State Management:** Zustand, React Hook Form + Zod validation
* **Charts:** Recharts
* **Backend:** Node.js, Express.js, TypeScript
* **Database:** MongoDB (Mongoose ODMs)
* **Real-time:** Socket.IO
* **External Services:** 
  * AI: Google Gemini 2.0 Flash
  * File Storage: Supabase Storage
  * Maps/Routing: Google Maps API
  * Weather/Soil: OpenWeather API, AgroMonitoring API
  * Notifications/OTP: Twilio (SMS), Resend (Email)

---

## 2. Folder Structure
The project uses a Turborepo monorepo setup.

```
agriassist/
├── turbo.json                  # Turborepo configuration
├── package.json                # Root package.json (workspaces)
├── apps/
│   ├── web/                    # Next.js 15 Frontend
│   │   ├── src/
│   │   │   ├── app/            # App router (role-based routes)
│   │   │   ├── components/     # Shared, UI components
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── lib/            # Utilities (api.ts, auth.ts)
│   │   │   ├── stores/         # Zustand stores
│   │   │   └── types/          # Frontend TS types
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   └── api/                    # Express.js Backend
│       ├── src/
│       │   ├── config/         # Database, Logger
│       │   ├── controllers/    # Route controllers
│       │   ├── middleware/     # Auth, error handling
│       │   ├── models/         # Mongoose schemas
│       │   ├── routes/         # API routes
│       │   ├── services/       # AI, Weather, Storage, SMS
│       │   ├── sockets/        # Socket.IO handlers
│       │   ├── utils/          # Pagination, custom errors
│       │   └── server.ts       # Entry point
│       └── package.json
└── packages/
    └── shared-types/           # (Future) Shared TS interfaces
```

---

## 3. Database Collections (Mongoose Models)
* **User:** Multi-role user accounts (authentication, profile).
* **OTP:** For phone verification and auth.
* **Farm:** Farmer's land details, soil type, and location.
* **Crop:** Farmer's inventory, status, expected yields.
* **Listing:** Marketplace entries (crops and waste).
* **Offer:** Buyer/Industry offers on listings (negotiation flow).
* **Contract:** Digital agreement between farmer and buyer.
* **Order:** Payment, tracking, and fulfillment record.
* **Payment:** Transaction ledger.
* **Invoice:** Generated billing documents.
* **Vehicle:** Transporter fleet management.
* **TransportBooking:** Logistics routing and status.
* **Notification:** In-app alerts for all users.
* **ChatRoom & ChatMessage:** Socket.IO direct and order-linked messaging.
* **GovernmentScheme:** Admin-managed schemes for farmers.
* **AuditLog:** Security and system logs.

---

## 4. API List (Express Routes)
* **`/api/auth`**: Register, login, OTP send/verify, token refresh, password reset.
* **`/api/farmer`**: Farms, crops, listings, offers, contracts, analytics, transport requests.
* **`/api/buyer`**: Marketplace browse, offers, contracts, orders, analytics.
* **`/api/transport`**: Vehicles, bookings (accept/pickup/deliver), fare calculator, route, analytics.
* **`/api/industry`**: Waste marketplace, offers, contracts, orders (quality check), sustainability metrics.
* **`/api/admin`**: User management (verify/suspend), platform analytics, marketplace monitor, schemes, audit logs.
* **`/api/marketplace`**: Shared listings, payment processing, global order tracking.
* **`/api/ai`**: Gemini chat, disease detection, crop recommendations, yield prediction, market insights.
* **`/api/weather`**: OpenWeather current and forecast endpoints.
* **`/api/maps`**: Geocoding, directions, nearby farmer discovery.
* **`/api/chat`**: Room creation and message history.
* **`/api/notifications`**: Read, mark all read, delete.
* **`/api/upload`**: Single and multiple file upload via Supabase.

---

## 5. Role Permissions
* **Farmer:** Can manage farms/crops, list on marketplace, negotiate offers, request transport, access AI and weather.
* **Buyer:** Can browse crop marketplace, make offers, sign contracts, pay for orders, track delivery.
* **Transport:** Can manage fleet (vehicles), accept booking requests, update live location, complete deliveries.
* **Industry:** Can browse waste marketplace, make offers, inspect quality, track carbon footprint.
* **Admin:** Full access. Can suspend/verify users, deactivate listings, view system-wide analytics, manage schemes.

---

## 6. UI Design System
* **Aesthetics:** Apple/Stripe-inspired premium enterprise SaaS, dark/light modes.
* **Glassmorphism:** Use `backdrop-blur-xl`, border accents (`border-white/10`), and translucent backgrounds.
* **Animations:** Mandatory `framer-motion` for page transitions (`page-enter`), staggered lists, and micro-interactions.
* **Theming:** 
  * Farmer: Green (`from-green-600 to-emerald-500`)
  * Buyer: Blue (`from-blue-600 to-cyan-500`)
  * Transport: Orange (`from-orange-600 to-amber-500`)
  * Industry: Purple (`from-purple-600 to-violet-500`)
  * Admin: Red/Rose (`from-red-600 to-rose-500`)
* **Components:** Custom Shadcn UI architecture tailored to the Glassmorphism theme (found in `src/components/ui/`).

---

## 7. Coding Standards
* **Strict TypeScript:** No `any` where possible.
* **Validation:** All incoming API requests must be validated using `Zod`.
* **State:** Use `zustand` for global frontend state, `react-hook-form` + `@hookform/resolvers/zod` for all forms.
* **API Calls:** Use the pre-configured `axios` client (`src/lib/api.ts`) exclusively. No direct `fetch`.
* **Error Handling:** Backend uses a global error middleware (`createApiError`). Frontend captures errors and displays them using Radix UI Toasts.
* **No Mock Data:** Only connect to real API endpoints.

---

## 8. RULES (Strict System Constraints)
1. **Never change Backend Contracts:** Do not arbitrarily alter existing API route signatures, JSON request body schemas, or URL structures. The frontend depends on them.
2. **Never change Schemas:** Do not remove fields from Mongoose schemas unless explicitly requested.
3. **Never change Authentication:** JWT middleware and OTP flows are finalized. Do not rewrite auth logic.
4. **No Console Logs in Production:** Use the Winston logger (`src/config/logger.ts`) for backend logging.
5. **No Placeholders:** If a feature requires an image or visual, use `lucide-react` icons, Framer Motion animations, or generate an asset. No simple "Lorem Ipsum" empty boxes.

---

## 9. Current Implementation Status
* **Monorepo:** Configured with Turborepo.
* **Backend:** 100% complete. All models, auth, middleware, services (AI, weather, maps, storage, sockets), and role-specific routes are implemented.
* **Frontend:** 
  * Design System (`globals.css`, `tailwind.config.ts`), generic layout, and stores are completed.
  * Marketing/Auth pages (Landing page with Framer Motion, Login, Register, Forgot Password) are completed.
  * Role dashboards (`/dashboard`), Maps, AI interfaces, Analytics frames, and major functional pages (Schemes, Transport, Marketplace) have been scaffolded.

---

## 10. Remaining Tasks
* Resolve frontend npm peer-dependency issues (e.g. `@radix-ui/react-badge` removal and `react 19` conflicts).
* Complete frontend API wire-ups (useEffect hooks using `src/lib/api.ts`) for the newly scaffolded pages (Offers, Contracts, Analytics charts with real data).
* Validate End-to-End WebSocket functionality (Live chat, Notifications, Live GPS updates on Maps).
* Thoroughly test the negotiation flow (Offer -> Counter -> Accept -> Contract -> Order -> Payment).
