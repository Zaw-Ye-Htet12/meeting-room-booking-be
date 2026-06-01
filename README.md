# Meeting Room Booking System - Backend

A progressive [NestJS](https://nestjs.com/) API managing users, roles, and reservations for a shared meeting room. It uses [Prisma](https://www.prisma.io/) to connect to a PostgreSQL database and enforces atomic schedule conflict checks.

---

## 🚀 Local Development Setup

Follow these quick steps to spin up the API locally:

### 1. Prerequisites
Ensure you have **Node.js (v18+)** and **Docker** installed.

### 2. Configure Environment
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/meeting_room?schema=public"
JWT_ACCESS_SECRET="develop_access_secret_key_change_me_in_prod"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="develop_refresh_secret_key_change_me_in_prod"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Spin up Database
Run PostgreSQL in the background using Docker Compose:
```bash
docker-compose up -d
```

### 4. Install & Prepare Database
Install dependencies and apply Prisma migrations & seeds:
```bash
npm install
npx prisma migrate dev
npx prisma db seed
```

### 5. Start Server
```bash
npm run start:dev
```
The API is now running locally at: **`http://localhost:3001/api`**

---

## 🎯 Seed Accounts

Use these pre-configured accounts to test role-based access control (all passwords are `password123`):

*   **Admin User**: `admin@test.com` (full user & role management)
*   **Owner User**: `owner@test.com` (view analytics & delete any booking)
*   **Regular User**: `user@test.com` (create & delete own bookings)

---

## 🌐 Production Environment

*   **Live Backend API**: [https://meeting-room-booking-be.onrender.com/api](https://meeting-room-booking-be.onrender.com/api)
*   **Interactive Swagger Docs**: [https://meeting-room-booking-be.onrender.com/api-docs](https://meeting-room-booking-be.onrender.com/api-docs)

---

## 🛠️ Deploying to Production (Render)
The backend is set up for hosting on **Render** (Node.js Web Service + PostgreSQL addon):
1. Build command: `./render-build.sh` (installs deps, compiles TypeScript, runs Prisma migrations).
2. Start command: `npm run start:prod`.
3. Set the environment variables in Render as shown in `.env.production` (e.g., `DATABASE_URL`, secrets, etc.).
