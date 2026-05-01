# TaskFlow — Team Task Manager

A production-ready full-stack web application for managing projects, assigning tasks, and tracking team progress with role-based access control.

## Tech Stack

- **Frontend:** React 18 + Vite, Tailwind CSS, React Router, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Auth:** JWT + bcryptjs

---

## Project Structure

```
taskflow/
├── backend/
│   ├── config/         # Database connection
│   ├── controllers/    # Business logic
│   ├── middleware/     # JWT auth, role guard
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express routers
│   ├── .env.example
│   ├── Procfile
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/ # Layout, reusable UI
    │   ├── context/    # AuthContext (React Context)
    │   ├── pages/      # All page components
    │   └── utils/      # Axios instance
    ├── .env.example
    └── vite.config.js
```

---

## Local Development Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
git clone <your-repo-url> taskflow
cd taskflow

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Configure Environment Variables

**Backend** — create `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your_strong_random_secret_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

**Frontend** — create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run Development Servers

Open two terminals:

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# Server starts on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev
# App starts on http://localhost:5173
```

---

## API Reference

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/signup` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login & get JWT |
| GET | `/api/auth/me` | Protected | Get current user |

### Projects
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/projects` | Admin only | Create project |
| GET | `/api/projects` | Protected | List user's projects |
| GET | `/api/projects/:id` | Member | Get project detail |
| POST | `/api/projects/:id/members` | Admin only | Add member by email |
| DELETE | `/api/projects/:id/members/:memberId` | Admin only | Remove member |
| DELETE | `/api/projects/:id` | Admin only | Delete project |

### Tasks
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/tasks` | Protected | Create task |
| GET | `/api/tasks` | Protected | List tasks (filterable) |
| PUT | `/api/tasks/:id` | Assignee/Admin | Update task |
| DELETE | `/api/tasks/:id` | Admin/Owner | Delete task |

### Dashboard
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/dashboard` | Protected | Stats + recent tasks |

---

## Role-Based Access Control

| Feature | Admin | Member |
|---------|-------|--------|
| Create projects | ✅ | ❌ |
| Add/remove members | ✅ | ❌ |
| Create tasks | ✅ | ❌ |
| Delete tasks/projects | ✅ | ❌ |
| Update task status | ✅ | ✅ (assigned only) |
| View assigned tasks | ✅ | ✅ |
| View dashboard | ✅ | ✅ |

---

## Deployment on Railway

### Backend Service

1. Go to [railway.app](https://railway.app) → New Project
2. Deploy from GitHub → Select your repo
3. Set **Root Directory** to `backend`
4. Railway auto-detects Node.js — set start command: `node server.js`
5. Add environment variables in Railway dashboard:

```
PORT=5000
MONGO_URI=<your Atlas connection string>
JWT_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
JWT_EXPIRES_IN=7d
CLIENT_URL=<your frontend URL on Railway>
```

6. Add a MongoDB plugin in Railway OR use MongoDB Atlas (recommended)

### Frontend Service

1. New service → Deploy from same repo
2. Set **Root Directory** to `frontend`
3. Set build command: `npm run build`
4. Set start command: `npx serve dist -p $PORT`
   (or use Railway's static site deployment)
5. Add environment variable:

```
VITE_API_URL=https://<your-backend-railway-url>/api
```

> **Important:** For Railway static sites, set `VITE_API_URL` before building. Vite bakes env vars at build time.

### MongoDB Atlas (Recommended for Production)

1. Create free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create database user with read/write access
3. Whitelist all IPs (`0.0.0.0/0`) for Railway compatibility
4. Copy connection string → set as `MONGO_URI` in Railway

---

## Sample Test Credentials

After running, create accounts via signup or use these if you seed:

```
Admin Account:
  Email:    admin@demo.com
  Password: admin123
  Role:     admin

Member Account:
  Email:    member@demo.com
  Password: member123
  Role:     member
```

### Quick Seed Script (optional)

```js
// backend/seed.js — run with: node seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({ email: { $in: ['admin@demo.com', 'member@demo.com'] } });
  await User.create([
    { name: 'Admin User', email: 'admin@demo.com', password: 'admin123', role: 'admin' },
    { name: 'Team Member', email: 'member@demo.com', password: 'member123', role: 'member' }
  ]);
  console.log('Seeded!');
  process.exit(0);
}
seed();
```

---

## Security Features

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens with configurable expiry
- Protected routes via middleware
- Input validation with express-validator
- Role-based authorization on all sensitive endpoints
- Tokens stored in localStorage with auto-logout on 401
- CORS configured with explicit origin whitelist

---

## Features Overview

- **Dashboard** — Stats (total/done/in-progress/overdue tasks + project count), progress bar, recent tasks
- **Projects** — Create, view, manage members (admin); view assigned projects (member)
- **Kanban Board** — Visual task board with Todo / In Progress / Done columns, filter by "My Tasks"
- **Task Management** — Create with title, description, assignee, priority, deadline; update status inline
- **Role Gates** — UI elements hidden based on role, API enforced separately