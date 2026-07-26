# 🥭 Deshi Fresh Bazar

> An Agritech fruit e-commerce platform delivering fresh, safe fruits directly from farms to doorsteps — built with **Next.js 15**, **TypeScript**, **Prisma**, and **Supabase (PostgreSQL)**.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)](https://www.prisma.io)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3-38BDF8?logo=tailwindcss)](https://tailwindcss.com)

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Schema](#-database-schema)
- [Available Scripts](#-available-scripts)
- [API Routes](#-api-routes)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Contact](#-contact)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 3 + Radix UI |
| **ORM** | Prisma 6 |
| **Database** | PostgreSQL via Supabase |
| **Auth** | NextAuth.js v4 (Credentials + Google OAuth) |
| **Storage** | Supabase Storage |
| **Rich Text** | Tiptap Editor |
| **Charts** | Recharts |
| **Courier** | SteadFast Courier API (Packzy) |
| **Analytics** | Meta Pixel + Conversions API (CAPI) |
| **Export** | XLSX (order export) |
| **Linter/Formatter** | Biome |
| **Package Manager** | npm / bun |

---

## 📁 Project Structure

```
freshbazar_app/
├── prisma/
│   ├── schema.prisma          # Database models
│   └── seed.js                # DB seed script
├── public/                    # Static assets
├── src/
│   ├── app/
│   │   ├── (pages)/
│   │   │   ├── about/
│   │   │   ├── cart/
│   │   │   ├── checkout/
│   │   │   │   └── success/
│   │   │   ├── contact/
│   │   │   ├── faq/
│   │   │   ├── fruits/        # Product listing
│   │   │   ├── gallery/
│   │   │   ├── login/
│   │   │   ├── orders/        # User order history
│   │   │   ├── privacy/
│   │   │   ├── product/[id]/  # Product detail page
│   │   │   ├── profile/
│   │   │   ├── register/
│   │   │   ├── return-policy/
│   │   │   ├── terms/
│   │   │   └── track-order/
│   │   ├── admin/             # Admin dashboard (protected)
│   │   │   ├── page.tsx       # Dashboard + OrderStatsChart
│   │   │   ├── orders/        # Order management + XLSX export
│   │   │   ├── products/      # Product CRUD + RichTextEditor
│   │   │   └── users/         # User management
│   │   ├── api/               # Next.js API routes
│   │   │   ├── admin/
│   │   │   │   ├── orders/    # (GET, PATCH) + /export (POST)
│   │   │   │   ├── products/  # (GET, POST) + /[id] (GET, PUT, DELETE)
│   │   │   │   ├── stats/     # Dashboard stats
│   │   │   │   └── categories/
│   │   │   ├── auth/[...nextauth]/
│   │   │   ├── orders/        # (POST) + /[id] (GET, PATCH)
│   │   │   ├── products/      # (GET) public product list
│   │   │   ├── upload/        # Supabase image upload
│   │   │   └── users/
│   │   │       └── profile/
│   │   ├── api-doc/           # Swagger UI
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── admin/
│   │   │   └── BottomMenuBar.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── RootLayout.tsx
│   │   ├── ui/                # Radix-based UI primitives
│   │   ├── AuthModal.tsx
│   │   ├── HeroSlider.tsx
│   │   ├── OrderStatsChart.tsx
│   │   ├── RichTextEditor.tsx # Tiptap-based editor
│   │   └── MetaPixelPageView.tsx
│   ├── contexts/
│   │   ├── CartContext.tsx    # Global cart state
│   │   └── UserContext.tsx    # Auth / session state
│   ├── lib/
│   │   └── auth.ts            # NextAuth config
│   ├── utils/
│   │   └── cookies.ts
│   └── middleware.ts          # Route protection
├── .env                       # Local environment variables (never commit)
├── next.config.js
├── tailwind.config.ts
├── biome.json
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **npm** ≥ 10 (or **bun**)
- A **Supabase** project (PostgreSQL database)
- A **GitHub** account (for OAuth, optional)

### 1. Clone the repository

```bash
git clone https://github.com/prosenjit07/Deshi-Fresh-Bazar.git
cd Deshi-Fresh-Bazar

# Switch to the most up-to-date branch
git checkout deployment-1
```

### 2. Install dependencies

```bash
npm install
# or
bun install
```

### 3. Set up environment variables

Copy the example below into a `.env` file at the root:

```bash
cp .env.example .env   # if .env.example exists, otherwise create .env manually
```

> See the [Environment Variables](#-environment-variables) section for all required keys.

### 4. Set up the database

```bash
# Push schema to your Supabase PostgreSQL database
npx prisma db push

# (Optional) Seed initial data
node prisma/seed.js

# (Optional) Open Prisma Studio to browse data
npx prisma studio
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The dev server uses **Turbopack** for fast refresh.

---

## 🔐 Environment Variables

Create a `.env` file in the project root with the following keys:

```env
# ─── Auth ───────────────────────────────────────────────
JWT_SECRET="your-jwt-secret"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# ─── Google OAuth (optional) ────────────────────────────
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# ─── Supabase ───────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# ─── Database (Prisma / PostgreSQL) ─────────────────────
# Pooled connection (for runtime queries)
SUPABASE_DATABASE="postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"
# Direct connection (for migrations & prisma db push)
SUPABASE_DATABASE_DIRECT_URL="postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:5432/postgres"

# ─── SteadFast Courier ──────────────────────────────────
STEADFAST_BASE_URL="https://portal.packzy.com/api/v1"
STEADFAST_API_KEY="your-steadfast-api-key"
STEADFAST_SECRET_KEY="your-steadfast-secret-key"

# ─── Meta Pixel / CAPI (optional) ───────────────────────
META_PIXEL_ID=your-pixel-id
META_API_VERSION=v19.0
META_ACCESS_TOKEN=your-meta-access-token
```

> [!IMPORTANT]
> Never commit `.env` to version control. It's already in `.gitignore`. Share secrets with teammates via a password manager or secrets vault.

---

## 🗄️ Database Schema

Database: **PostgreSQL** on Supabase, managed via **Prisma ORM**.

```
User
 ├── id, name, email, password, role (USER | ADMIN)
 ├── cart → CartItem[]
 └── orders → Order[]

Product
 ├── id, name, slug, description, details (rich text)
 ├── price, image, stock, status (ACTIVE | INACTIVE | ARCHIVED)
 ├── sequence (display order), archivedAt
 ├── category → Category
 ├── cartItems → CartItem[]
 ├── orderItems → OrderItem[]
 └── packages → Package[]

Category
 └── id, name, slug, description, image

Package
 └── id, name, price → Product

Order
 ├── id, customerName, customerPhone, shippingAddress
 ├── subtotal, shippingCost, totalAmount, paymentMethod
 ├── status (PENDING | PROCESSING | SHIPPED | DELIVERED | CANCELLED)
 ├── courierProvider, courierConsignmentId, courierTrackingCode (SteadFast)
 ├── user → User (optional, supports guest checkout)
 └── items → OrderItem[]

OrderItem
 └── productName, productImage, quantity, unitPrice, packageType

CartItem
 └── userId + productId + selectedPackage (unique composite)
```

![Database Schema](https://github.com/user-attachments/assets/22cea62c-ccf3-434a-adb9-f55f0a415324)

---

## 📜 Available Scripts

```bash
npm run dev        # Start dev server (Turbopack, binds 0.0.0.0:3000)
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Biome lint + TypeScript type-check
npm run format     # Biome auto-format
node prisma/seed.js    # Seed database
npx prisma studio      # Open Prisma Studio (DB GUI)
npx prisma db push     # Push schema changes to DB
npx prisma generate    # Regenerate Prisma Client
```

---

## 🌐 API Routes

All routes are under `src/app/api/`. Key endpoints:

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/products` | Public | List all active products |
| `POST` | `/api/orders` | Public | Place a new order |
| `GET` | `/api/orders/[id]` | User | Get order details + tracking |
| `GET` | `/api/admin/products` | Admin | List all products (incl. archived) |
| `POST` | `/api/admin/products` | Admin | Create product |
| `PUT` | `/api/admin/products/[id]` | Admin | Update product |
| `DELETE` | `/api/admin/products/[id]` | Admin | Delete product |
| `GET` | `/api/admin/orders` | Admin | List all orders |
| `PATCH` | `/api/admin/orders/[id]` | Admin | Update order status |
| `POST` | `/api/admin/orders/export` | Admin | Export orders as XLSX |
| `GET` | `/api/admin/stats` | Admin | Dashboard statistics |
| `GET` | `/api/admin/categories` | Admin | List categories |
| `GET/POST` | `/api/users/profile` | User | Get / update user profile |
| `GET` | `/api-doc` | Public | Swagger API documentation |

---

## 🚢 Deployment

The app is deployed on a **DigitalOcean** VPS via GitHub Actions CI/CD.

For Netlify or Vercel:

```bash
# Vercel
vercel deploy

# Netlify (configured via netlify.toml)
netlify deploy --prod
```

Production environment variables must be set in your hosting dashboard. For the database, use the **pooled** `SUPABASE_DATABASE` URL at runtime and the **direct** `SUPABASE_DATABASE_DIRECT_URL` only for migrations.

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines to keep the codebase consistent and the review process smooth.

### Branching Strategy

```
main              ← stable, mirrors production
deployment-1      ← most updated, pre-production
feature/*         ← new features
fix/*             ← bug fixes
chore/*           ← maintenance, dependencies, docs
```

### Step-by-Step Contribution Flow

**1. Fork & Clone**

```bash
git clone https://github.com/your-username/Deshi-Fresh-Bazar.git
cd Deshi-Fresh-Bazar
```

**2. Create a branch from `deployment-1`**

```bash
git checkout deployment-1
git pull origin deployment-1
git checkout -b feature/your-feature-name
```

**3. Set up your environment**

Follow the [Getting Started](#-getting-started) steps above. Make sure the app runs locally before making changes.

**4. Make your changes**

- Keep changes focused and surgical — one feature or fix per branch.
- Follow the existing code style (Biome handles formatting).
- Don't introduce new dependencies without discussion.

**5. Lint & format before committing**

```bash
npm run lint
npm run format
```

**6. Write meaningful commit messages**

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
feat(admin): add bulk order status update
fix(checkout): handle empty cart edge case
chore(deps): upgrade prisma to 6.20
refactor(product): extract package selector component
docs(readme): update env variable table
```

**7. Push and open a Pull Request**

```bash
git push origin feature/your-feature-name
```

Open a PR against the `deployment-1` branch (not `main`). Fill in the PR template:
- What does this PR do?
- How to test it?
- Any screenshots (for UI changes)?

**8. Code Review**

- At least one maintainer review is required before merging.
- Address all review comments before requesting a re-review.
- Keep PRs small and focused — large PRs take longer to review.

### Code Style Guidelines

- **TypeScript**: Always type your props, API responses, and function signatures.
- **Components**: Use functional components with named exports.
- **API Routes**: Always validate input and return consistent JSON error shapes.
- **Prisma**: Use `prisma.$transaction` for multi-step DB operations.
- **No `console.log` in production code** — use structured logging if needed.
- **Tailwind**: Use Tailwind utility classes; avoid inline styles.

### Reporting Bugs

Open a [GitHub Issue](https://github.com/prosenjit07/Deshi-Fresh-Bazar/issues) with:
- Steps to reproduce
- Expected vs. actual behavior
- Browser/Node version
- Screenshots if applicable

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👥 Contact

| | |
|---|---|
| 🌐 Website | [deshifreshbazar.com](https://www.deshifreshbazar.com) |
| 📧 Email | [deshifreshbazar@gmail.com](mailto:deshifreshbazar@gmail.com) |
| 📞 Phone | 01560001192 |
| 🐙 GitHub | [@prosenjit07](https://github.com/prosenjit07) |

---

> Built with ❤️ for Bangladeshi farmers and fresh food lovers.
