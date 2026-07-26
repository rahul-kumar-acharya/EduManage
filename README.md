# School SaaS (EduManage / SchoolHub SaaS)

A production-grade, multi-tenant School Management SaaS platform built with **Django REST Framework** (Backend) and **React + Vite + Tailwind CSS** (Frontend).

## Project Overview

SchoolHub SaaS delivers isolated tenant workspaces for schools with wildcard subdomain routing (`abcschool.xyz.com`), custom role-based permissions, automated subscription management, academic operations, attendance tracking, exam management, fee collection, and comprehensive reporting.

---

## Technical Architecture & Domain Flow

```
xyz.com (Main Marketing & Registration Website)
   │
   ├── admin.xyz.com (Super Admin Panel for SaaS operations)
   │
   └── School Subdomains (Multi-Tenant Portals)
         ├── abcschool.xyz.com
         ├── dpspatna.xyz.com
         └── stmary.xyz.com
```

Each incoming request is mapped to a specific `School` tenant via domain resolution (`TenantMiddleware` in backend, `subdomain.js` in frontend).

---

## Tech Stack

- **Backend**: Python 3.11+, Django 5.x, Django REST Framework, SimpleJWT, SQLite (Dev) / PostgreSQL (Prod)
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Axios, React Router v6
- **Architecture**: Multi-tenant database model with tenant isolation filters (`school_id`), JWT Authentication, Role-based Access Control (RBAC)

---

## Project Structure

```
school-saas/
│
├── frontend/         # React + Vite + Tailwind CSS SPA
├── backend/          # Django REST Framework API engine
├── docs/             # Technical documentation & blueprints
│   ├── architecture.md
│   ├── api-documentation.md
│   ├── database-design.md
│   └── deployment.md
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- Git

### Backend Setup
```bash
cd backend
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`.
You can test subdomains locally by adding entries to your `hosts` file or sending the `X-Tenant-Subdomain` header.

---

## Key Features

- **Multi-Tenant Subdomain Architecture**: Dynamic subdomain parsing & database query isolation
- **Role-Based Access Control**: Super Admin, School Admin, Teacher, Student, Parent, Accountant, Staff
- **Subscription & Payment System**: Free trials, subscription plans, and billing
- **Academics & Operations**: Classes, Sections, Subjects, Attendance, Homework, Timetable, Exams, Fees, Notices
- **Export & Reports**: Modular analytics for fee collections, attendance, and exam report cards

---

## License
MIT License - Developed as a high-performance multi-tenant school management SaaS.
