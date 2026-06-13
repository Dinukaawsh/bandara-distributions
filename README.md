# Bandara Store — Billing System

Next.js billing and inventory app for **Bandara Store**. Migrated from the legacy PHP app with MongoDB as the database, Sinhala/English UI, admin dashboard, and POS billing.

## Tech stack

- **Next.js 16** (App Router)
- **React 19**
- **Tailwind CSS v4**
- **MongoDB** (Atlas or local)

## Prerequisites

- Node.js 18+
- MongoDB database (MongoDB Atlas recommended)
- npm

## Quick start

```bash
cd bandara
npm install
```

Create a `.env` file in the project root:

```env
MONGO_URL=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
NEXT_PUBLIC_URL=http://localhost:3000
SETUP_SECRET=your-setup-secret-here
```

> **Note:** The app uses the MongoDB database name `billing_system` (set in code). The database name in the connection URL path is ignored.

Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## First-time setup

1. Visit `/setup/admin` and create the first admin user (only works when the database has **no users**).
2. `SETUP_SECRET` must be set in `.env` to enable setup.
3. Log in at `/login` — admin and cashier use the same login page.
4. As admin, open **Billing** and add products before scanning barcodes.

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Start development server |
| `npm run build`| Production build         |
| `npm run start`| Run production server    |
| `npm run lint` | Run ESLint               |

## Main routes

| Route              | Access   | Purpose                    |
|--------------------|----------|----------------------------|
| `/login`           | Public   | Login (admin + cashier)    |
| `/billing`         | Auth     | POS / billing              |
| `/settings`        | Admin    | System settings hub        |
| `/settings/products` | Admin  | Manage products            |
| `/manage-store`    | Admin    | Store name, address, phone |
| `/manage-users`    | Admin    | User accounts              |
| `/sales-report`    | Admin    | Monthly sales reports      |
| `/stock-alerts`    | Admin    | Low stock items            |
| `/profile`         | Auth     | Profile & invoice name     |
| `/change-password` | Auth     | Change password            |
| `/setup/admin`     | Public*  | First admin creation       |

\* Setup is disabled after the first user exists.

## Features

- **Billing (POS)** — barcode scan, qty, cash payment, thermal-style print
- **Product management** — add, edit, delete, search
- **User management** — admin / cashier roles, counters
- **Sales reports** — monthly totals, profit, bill list
- **Stock alerts** — items at or below 5 units
- **End of day** — daily summary modal, then logout
- **Backup** — download JSON export from Settings
- **Sinhala + English** — language switch on login and top bar
- **Modals** — confirmations and alerts (logout, delete, view items, etc.)

## MongoDB collections

| Collection       | Purpose                          |
|------------------|----------------------------------|
| `users`          | Login accounts                   |
| `products`       | Barcode, prices, stock           |
| `store_details`  | Shop name, address, phone        |
| `sales_orders`   | Bill headers                     |
| `sales_items`    | Line items per bill              |

## Project structure

```
app/
  (auth)/          Login, setup pages
  (dashboard)/     Billing, admin pages (sidebar + topbar)
  api/             REST API routes
components/
  ui/              Buttons, inputs, dropdowns, modals
  layout/          Sidebar, topbar, dashboard shell
  modals/          End of day, product view, stock alerts
hooks/             useSession, useLang, useDialog
lib/               auth, db, translations, nav
```

## API overview

- `POST /api/login` — authenticate
- `GET /api/auth/me` — current session
- `GET/POST /api/products` — product list & add
- `POST /api/bills` — save bill & reduce stock
- `GET/PUT /api/store` — store details
- `GET/POST/PUT/DELETE /api/users` — user CRUD
- `GET/DELETE /api/sales-report` — reports
- `GET /api/stock-alerts` — low stock
- `POST /api/end-of-day` — daily report & logout

All protected routes require session cookies set at login.

## Language

Default language is **Sinhala** (`si`). Users can switch to English from the login page or dashboard top bar. Labels use `lib/translations.ts` and per-page `t(si, en)` helpers.

## Production

```bash
npm run build
npm run start
```

Set `MONGO_URL`, `NEXT_PUBLIC_URL`, and `SETUP_SECRET` in your hosting environment. Use `mongodb+srv://` for MongoDB Atlas.

## Legacy PHP app

The original PHP billing app is kept under `Billing/` for reference only. The active application is this Next.js project.

## Support

Software by TMsoftware — (0759335156)
