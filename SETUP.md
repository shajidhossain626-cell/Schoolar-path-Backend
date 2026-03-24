# ScholarPath BD — Backend Setup Guide

## Quick Start (5 steps)

### Step 1 — Install dependencies
```bash
cd scholarpath-backend
npm install
```

### Step 2 — Set up Supabase (free database)
1. Go to https://supabase.com and sign up free
2. Click "New Project" → name it "scholarpath"
3. Save your database password somewhere safe
4. Go to Project Settings → Database → copy the "URI" connection string

### Step 3 — Configure environment
```bash
cp .env.example .env
```
Edit `.env` and fill in:
- `DATABASE_URL` — paste your Supabase URI (replace [YOUR-PASSWORD] with your password)
- `JWT_SECRET` — any long random string (min 32 chars)
- `ANTHROPIC_API_KEY` — from console.anthropic.com

### Step 4 — Set up the database
```bash
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
```
This creates all tables and adds sample data.

### Step 5 — Start the server
```bash
npm run dev
```
Server starts at http://localhost:5000

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login |
| GET  | /api/auth/me | Get current user |
| PUT  | /api/auth/profile | Update profile |
| PUT  | /api/auth/password | Change password |

### Scholarships
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | /api/scholarships | List + filter |
| GET  | /api/scholarships/:id | Get one |
| POST | /api/scholarships/:id/save | Save/unsave |
| GET  | /api/scholarships/saved | My saved list |
| POST | /api/scholarships | Create (admin) |
| PUT  | /api/scholarships/:id | Update (admin) |

### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | /api/applications/me | My applications |
| POST | /api/applications | Create |
| PUT  | /api/applications/:id | Update status |
| DELETE | /api/applications/:id | Delete |

### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | /api/documents/me | My documents |
| POST | /api/documents/upload | Upload file |
| DELETE | /api/documents/:id | Delete |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/payments/initiate | Start payment |
| POST | /api/payments/success | Confirm payment |
| GET  | /api/payments/me | My payment history |
| POST | /api/payments/webhook | SSLCommerz IPN |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/ai/ask | Ask AI advisor |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | /api/notifications | Get all |
| PUT  | /api/notifications/read-all | Mark all read |

### Contact
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/contact | Send message |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | /api/admin/stats | Dashboard stats |
| GET  | /api/admin/users | All users |
| PUT  | /api/admin/applications/:id/status | Update status |

---

## Connecting to React Frontend

In your frontend `scholarpath` folder, edit `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

In `src/context/AuthContext.jsx`, the login/signup functions are already
set up to call `/api/auth/login` — they just need the VITE_API_URL env var.

---

## Deploying Backend to Railway
1. Push this folder to a separate GitHub repo
2. Go to railway.app → New Project → Deploy from GitHub
3. Add all .env variables in the Railway dashboard
4. Railway gives you a public URL like: https://scholarpath-backend.up.railway.app

Then update your frontend .env:
```
VITE_API_URL=https://scholarpath-backend.up.railway.app/api
```

---

## Test Credentials (after seeding)
- Admin: admin@scholarpath.com.bd / admin123456
- User:  test@example.com / test123456
