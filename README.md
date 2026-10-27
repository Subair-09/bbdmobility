# BBD Mobility — Delivery Booking Platform

A premium, production-quality, fully responsive delivery booking website for **BBD Mobility**, meticulously recreated from the official visual design specification.

---

## 🚀 Key Features

- **Exact Visual Recreation**:
  - Precision brand typography with deep navy (`#092957`), brand red (`#E30620`), and light grey accents.
  - Two-sided Hero section with active Book a Delivery card, 4 quick feature badges, and photographic courier visual.
  - Signature diagonal brand racing stripes (top right and split-section bottom right).
  - 4-column horizontal Benefits Strip with subtle vertical dividers.
  - "What We Deliver" section with 5 service cards (interactive with the booking form).
  - High-definition highway courier split section with dark navy "Real People. Real Deliveries." panel and "Why Choose BBD Mobility?" benefit list.
  - "Trusted by Thousands" customer testimonials with carousel navigation and 5-star ratings.
  - Complete 5-column corporate footer with working newsletter subscription, social links, legal modals, and "Move What Matters" brandmark.

- **Interactive Multi-Step Booking Experience**:
  - **Step 1**: Quick booking (Service Type, Pickup Address, Drop-off Address, Package Details).
  - **Step 2**: Sender & Recipient contact information (Name, Phone, optional Email for confirmation, Special Instructions).
  - **Step 3**: Summary review screen before final dispatch commitment.
  - **Step 4**: Confirmed booking screen displaying a unique dispatch reference (e.g. `BBD-20261027-XXXX`), dispatch helpline, and next steps.

- **No-Database Architecture with Resend Email Integration**:
  - Lean and secure serverless/Node.js API endpoint (`/api/bookings`).
  - Sends booking dispatch details directly to the business owner inbox (`BUSINESS_EMAIL`).
  - Sends confirmation receipt to customer if email is provided.
  - HTML email content sanitization and anti-spam in-memory rate limiting.
  - Zero sensitive database exposure or unnecessary user accounts.
  - Safe development mode fallback when Resend API key is not yet set.

- **No Live-Tracking Principle**:
  - Stays 100% faithful to the authentic courier booking experience without fabricated GPS maps, fake tracking dashboards, or misleading ETAs.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite 6, TypeScript, Tailwind CSS, Lucide Icons
- **Backend API**: Node.js, Express, TSX, Resend SDK, Cors, Dotenv
- **Testing & Verification**: Puppeteer-Core, Microsoft Edge / Chrome Headless, Pillow

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configuration variables:
```env
PORT=3001
RESEND_API_KEY=your_resend_api_key_here
BUSINESS_EMAIL=support@bbdmobility.com
FROM_EMAIL="BBD Mobility <onboarding@resend.dev>"
```
> **Note**: If `RESEND_API_KEY` is left blank, the server operates in **Development Mode**, logging structured booking submissions to the console and returning successful booking reference codes to the frontend.

### 3. Start Development Server
To run both the Vite frontend (`http://localhost:5173`) and the API backend (`http://localhost:3001`) simultaneously:
```bash
npm run dev
```

Or run them individually:
```bash
# Frontend only
npm run dev:frontend

# Backend server only
npm run dev:server
```

### 4. Build for Production
```bash
npm run build
```

---

## 📂 Project Structure

```
bbdmobility/
├── public/
│   └── assets/
│       ├── logo.png               # Official BBD Mobility brand logo
│       ├── logo-white.png         # White contrast version for dark navy footer
│       ├── hero-composite.jpg     # Courier & customer photo with city skyline
│       ├── highway-rider-hd.jpg   # High-definition highway courier photo
│       ├── avatar-ngozi-hd.jpg    # Customer avatar (Lagos)
│       ├── avatar-tunde-hd.jpg    # Customer avatar (Abuja)
│       └── avatar-faith-hd.jpg    # Customer avatar (Port Harcourt)
├── server/
│   └── index.ts                   # Express server with /api/bookings & /api/newsletter
├── src/
│   ├── components/
│   │   ├── Navbar.tsx             # Responsive header with active state & phone CTA
│   │   ├── Hero.tsx               # Hero composition with headline, icons & visual
│   │   ├── BookingCard.tsx        # Multi-step booking form with validation & API call
│   │   ├── BenefitsStrip.tsx      # 4 horizontal service badges with dividers
│   │   ├── ServicesSection.tsx    # What We Deliver with 5 interactive service cards
│   │   ├── WhyChooseUsSection.tsx # Split section with highway rider & benefits
│   │   ├── TestimonialsSection.tsx# Testimonials with carousel & 5-star ratings
│   │   ├── Footer.tsx             # 5-column footer with newsletter & legal links
│   │   ├── AllServicesModal.tsx   # Detailed modal of delivery services
│   │   ├── ReviewsModal.tsx       # Modal with additional verified customer feedback
│   │   └── InfoModal.tsx          # How It Works, About, FAQs, Contact, Privacy, Terms
│   ├── types/
│   │   └── index.ts               # TypeScript interfaces
│   ├── App.tsx                    # Main landing page application layout
│   ├── index.css                  # Tailwind styles and custom utilities
│   └── main.tsx                   # React root entry point
├── .env.example                   # Template environment variables
├── package.json                   # Dependencies and scripts
├── tailwind.config.js             # BBD Mobility color palette & design tokens
└── vite.config.ts                 # Vite setup with /api proxy to port 3001
```

---

## 🔒 Security & Privacy

1. **No Sensitive Data Exposure**: The Resend API key is never bundled in frontend code; all mail handling runs strictly on the backend.
2. **HTML Sanitization**: All customer inputs are HTML-escaped before insertion into confirmation emails.
3. **Rate Limiting**: Integrated in-memory sliding window rate limiter protects endpoints from spam submissions.
4. **No Unneeded Persistence**: Complies with privacy standards by not storing personal customer information in an unnecessary database.
