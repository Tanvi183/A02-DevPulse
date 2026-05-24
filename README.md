# DevPulse – Internal Tech Issue & Feature Tracker

A collaborative REST API platform for software teams to report bugs, suggest features, and coordinate resolutions.

**Live URL:** `https://devpulse-flame.vercel.app/`  
**GitHub:** `https://github.com/Tanvi183/A02-DevPulse`

---

## Features

- JWT-based authentication (signup / login)
- Role-based access control: `contributor` and `maintainer`
- Full CRUD for issues (bug reports & feature requests)
- Filtering & sorting on issue list
- Maintainer-only workflow status transitions
- Internal system metrics endpoint
- PostgreSQL with raw SQL (no ORM, no query builders)

---

## Tech Stack

| Technology | Notes |
|---|---|
| Node.js | LTS 24.x |
| TypeScript | 5.x (strict mode) |
| Express.js | Modular router architecture |
| PostgreSQL | Native `pg` driver, raw `pool.query()` |
| bcrypt | Password hashing (salt rounds: 10) |
| jsonwebtoken | JWT generation & verification |
| http-status-codes | Consistent HTTP status references |

---

## Setup

### 1. Clone & install

```bash
git clone https://github.com/yourusername/devpulse.git
cd devpulse
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your values
```

**Required environment variables:**

```
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/devpulse
JWT_SECRET=your_super_secret_key
NODE_ENV=development
```

### 3. Run in development

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
npm start
```

---

## Database Schema

### `users`

| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | Auto-increment |
| name | VARCHAR(255) | Required |
| email | VARCHAR(255) | Unique, required |
| password | VARCHAR(255) | Hashed, never returned |
| role | VARCHAR(20) | `contributor` \| `maintainer`, default `contributor` |
| created_at | TIMESTAMPTZ | Auto-set on insert |
| updated_at | TIMESTAMPTZ | Auto-refreshed on update |

### `issues`

| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | Auto-increment |
| title | VARCHAR(150) | Required, max 150 chars |
| description | TEXT | Required, min 20 chars |
| type | VARCHAR(20) | `bug` \| `feature_request` |
| status | VARCHAR(20) | `open` \| `in_progress` \| `resolved`, default `open` |
| reporter_id | INTEGER | References users.id (app-level validation) |
| created_at | TIMESTAMPTZ | Auto-set on insert |
| updated_at | TIMESTAMPTZ | Auto-refreshed on update |

---

## API Endpoints

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login and receive JWT |

### Issues

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/issues` | Public | List all issues (filterable/sortable) |
| GET | `/api/issues/:id` | Public | Get single issue |
| POST | `/api/issues` | Authenticated | Create new issue |
| PATCH | `/api/issues/:id` | Authenticated* | Update issue fields |
| PATCH | `/api/issues/:id/status` | Maintainer | Change issue status |
| DELETE | `/api/issues/:id` | Maintainer | Delete issue |

> *Contributors can only edit their own issues when status is `open`. Maintainers can edit any issue.

### Metrics

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/metrics` | Maintainer | System metrics summary |

### Query Parameters for `GET /api/issues`

| Param | Values | Default |
|---|---|---|
| `sort` | `newest`, `oldest` | `newest` |
| `type` | `bug`, `feature_request` | (none) |
| `status` | `open`, `in_progress`, `resolved` | (none) |

### Authorization Header

```
Authorization: <JWT_TOKEN>
```

---

## Deployment (Vercel + NeonDB)

1. Create a PostgreSQL database on [NeonDB](https://neon.tech) or [Supabase](https://supabase.com)
2. Push code to GitHub
3. Import the repo to [Vercel](https://vercel.com)
4. Set environment variables in Vercel project settings
5. Deploy – tables are auto-created on first start

---

## Project Structure

```
src/
├── config/
│   ├── database.ts        # pg Pool instance
│   └── schema.ts          # Table creation SQL
├── middleware/
│   ├── auth.ts            # JWT authenticate + requireRole guards
│   └── errorHandler.ts    # Centralized error handler
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.routes.ts
│   │   └── auth.service.ts
│   ├── issues/
│   │   ├── issues.controller.ts
│   │   ├── issues.routes.ts
│   │   └── issues.service.ts
│   └── metrics/
│       └── metrics.routes.ts
├── types/
│   ├── index.ts           # All shared TypeScript interfaces
│   └── express.d.ts       # Express Request augmentation
├── utils/
│   ├── jwt.ts             # signToken / verifyToken helpers
│   ├── response.ts        # sendSuccess / sendError helpers
│   └── validation.ts      # Input validators
├── app.ts                 # Express app setup
└── index.ts               # Bootstrap entry point
```
