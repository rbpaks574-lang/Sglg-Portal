# SGLG Document Submission Portal with Analytics

**Seal of Good Local Governance — Silang, Cavite**

A centralized web portal for DILG compliance document submission, validation, and analytics across 64 component barangays.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Vite + Tailwind CSS + DaisyUI |
| Backend | Laravel 10 + Sanctum Auth |
| Database | MySQL (XAMPP) |
| HTTP Client | Axios |
| Charts | Recharts |

## User Roles

| Role | Description |
|------|-------------|
| **Barangay Submitter** | Upload compliance documents, track status, view scores |
| **Checker** | Review/validate submissions, approve or return with remarks |
| **Admin** | Full dashboard, analytics, user management, announcements, audit logs |

## Features

- 📄 Document submission with file upload (PDF, DOCX, XLSX, JPG, PNG)
- 📊 Compliance scoring and ranking for all 64 barangays
- ✅ Review workflow: Pending → Under Review → Verified / Returned
- 💬 Feedback system with remarks and correction notes
- 📢 Broadcast announcements with priority levels
- 📈 Analytics dashboard with charts and visual insights
- 👥 User management with role-based access
- 📋 Audit log tracking all system activities
- 🎨 Senior-friendly UI: large text, high contrast, minimal design

---

## Setup Instructions

### Prerequisites
- PHP 8.1+
- Composer
- Node.js 18+
- MySQL (via XAMPP)

### 1. Backend Setup

```bash
cd backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Create MySQL database 'sglg_portal' via phpMyAdmin
# Then update .env with your database credentials

# Run migrations
php artisan migrate

# Seed database (64 barangays + categories + test users)
php artisan db:seed

# Create storage link for file uploads
php artisan storage:link

# Start the server
php artisan serve
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. Access the Portal

Open `http://localhost:5173` in your browser.

### Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@dilg-silang.gov.ph | password |
| Checker | checker@dilg-silang.gov.ph | password |
| Barangay 1 | barangay1@silang.gov.ph | password |
| Barangay 2 | barangay2@silang.gov.ph | password |
| Barangay 3 | barangay3@silang.gov.ph | password |
| Barangay 4 | barangay4@silang.gov.ph | password |
| Barangay 5 | barangay5@silang.gov.ph | password |

---

## Project Structure

```
project-dilg/
├── backend/                    # Laravel API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/   # API controllers
│   │   │   └── Middleware/        # Role middleware
│   │   └── Models/                # Eloquent models
│   ├── database/
│   │   ├── migrations/            # Database schema
│   │   └── seeders/               # 64 barangays + test data
│   └── routes/
│       └── api.php                # API routes
├── frontend/                   # React SPA
│   └── src/
│       ├── components/
│       │   ├── layout/            # Role-based layouts
│       │   └── common/            # Shared components
│       ├── context/               # Auth context
│       ├── pages/                 # Page components
│       └── services/              # Axios API layer
└── README.md
```

## API Endpoints

### Auth
- `POST /api/login` — Login
- `POST /api/logout` — Logout
- `GET /api/me` — Current user

### Barangay
- `GET /api/barangay/dashboard` — Dashboard data
- `GET /api/barangay/required-documents` — Documents to submit
- `POST /api/barangay/submissions` — Submit document
- `POST /api/barangay/submissions/{id}/resubmit` — Resubmit returned

### Checker
- `GET /api/checker/dashboard` — Checker dashboard
- `GET /api/checker/pending` — Pending queue
- `POST /api/submissions/{id}/review` — Approve/return

### Admin
- `GET /api/admin/dashboard` — Admin stats
- `GET /api/admin/analytics` — Analytics data
- `GET/POST /api/admin/users` — User management
- `GET /api/admin/barangays` — Barangay list
- `GET/POST /api/announcements` — Announcements
- `GET /api/admin/audit-logs` — Audit trail

---

## SGLG Categories

1. **Financial Administration** (Core) — Budget, disclosures, procurement
2. **Disaster Preparedness** (Core) — Plans, equipment, drills
3. **Peace and Order** (Core) — Safety plans, tanod reports
4. **Social Protection** (Essential) — BCPC, PWD, VAWC
5. **Environmental Management** (Essential) — Clean-up, ordinances
6. **Business Friendliness** (Essential) — Permits, economic plans

---

## Design Principles

- **Minimal & Clean**: White/black color scheme, no visual clutter
- **Senior-Friendly**: Large fonts (18px base), high contrast, big buttons
- **Clear Status**: Color-coded badges for submission states
- **Accessible**: Simple navigation, clear labels, confirmation dialogs
