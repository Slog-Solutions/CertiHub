# Slog Solutions — Training & Certification Management Platform (MERN)

Slog Solutions is a MERN-stack dashboard solution that manages course lookup masters, CRM enquires, registrations, payments, database backups, and certificate uploads.

## Features
- **Tabbed Masters Configuration**: Technologies, Durations, Branches, Colleges, and Course Details.
- **Tuition Installments Logging**: Log installments inside modal tables with real-time remaining calculations.
- **Bulk Excel Certifications**: Download sample sheets, upload populated tables, issue certificates via QR-embedded PDF, and download batch packs zipped.
- **Public Scoped Registration & Verify Pages**: Pre-fills registration forms from unique link identifiers; verify certificate IDs.
- **Daily JSON Dumps Backups**: Automated daily midnight cron backups with config file retention limits.

## Project Structure
- `backend/`: Express Server routing, Mongoose database models, PDFKit generators, node-cron backups.
- `frontend/`: Vite React app dashboard, Tailwind CSS styles, Recharts analytics, SheetJS imports/exports.
- `package.json`: Orchestrates running both backend and frontend concurrently in development.

## Quick Start Installation

### 1. Prerequisites
- **Node.js** (v16+)
- **MongoDB** (Running local instance or cloud URI connection)

### 2. Configure Environment variables
Navigate to the `backend/` folder, copy the example file, and customize details:
```bash
cd backend
cp .env.example .env
```
Ensure `MONGODB_URI` points to your running database instance, and `JWT_SECRET` is set.

### 3. Install dependencies
From the **root** folder, run:
```bash
npm run install-all
```
This command installs root devDependencies, and recursively triggers `npm install` inside both `/backend` and `/frontend` folders.

### 4. Seed Default Admin
The default admin account is seeded **automatically** on first server start if no Admin account exists.
The server generates a secure, randomized password and prints it **exactly once** in the terminal console. Copy and save these credentials to sign in.
- **Default Username**: `admin`
- **Default Password**: (Logged to the console on startup)

### 5. Launch Development Servers
From the **root** folder, execute:
```bash
npm run dev
```
This runs the Express API server on `http://localhost:5000` and the React Vite client on `http://localhost:5173` concurrently. Vite automatically proxies `/api` and `/uploads` requests.
