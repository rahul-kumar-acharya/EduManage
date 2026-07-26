# EduManage

A production-grade, multi-tenant School Management SaaS platform built with **Django REST Framework** (Backend) and **React + Vite + Tailwind CSS** (Frontend).

## Project Overview

EduManage delivers isolated tenant workspaces for schools with wildcard subdomain routing (`abcschool.edumanage.acharyaworks.in`), custom role-based permissions, automated subscription management, academic operations, attendance tracking, exam management, fee collection, and comprehensive reporting.

---

## Technical Architecture & Domain Flow

```
edumanage.acharyaworks.in (Main Marketing & Registration Website)
   │
   ├── admin.edumanage.acharyaworks.in (Super Admin Panel for SaaS operations)
   │
   └── School Subdomains (Multi-Tenant Portals)
         ├── abcschool.edumanage.acharyaworks.in
         ├── dpspatna.edumanage.acharyaworks.in
         └── stmary.edumanage.acharyaworks.in
```

Each incoming request is mapped to a specific `School` tenant via domain resolution (`TenantMiddleware` in backend, `subdomain.js` in frontend).

---

## Tech Stack

- **Backend**: Python 3.11+, Django 5.x, Django REST Framework, SimpleJWT, SQLite (Dev) / PostgreSQL (Prod)
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Axios, React Router v6
- **Architecture**: Multi-tenant database model with tenant isolation filters (`school_id`), JWT Authentication, Role-based Access Control (RBAC)

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