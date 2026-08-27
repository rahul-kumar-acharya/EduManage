# AcharyaCampus — Multi-Tenant School Operating System & ERP

AcharyaCampus is an enterprise-grade multi-tenant School Operating System built with **React (Vite)** and **Django REST Framework**.

AcharyaCampus delivers isolated tenant workspaces for schools with wildcard subdomain routing (`abcschool.campus.acharyaworks.in`), custom role-based permissions, automated subscription management, academic operations, attendance tracking, exam management, fee collection, and comprehensive reporting.

---

## 🏛️ Multi-Tenant Architecture

```text
campus.acharyaworks.in (Main Marketing & Registration Website)
   │
   ├── admin.campus.acharyaworks.in (Super Admin Panel for SaaS operations)
   │
   └── [Tenant Subdomains]
         ├── abcschool.campus.acharyaworks.in
         ├── dpspatna.campus.acharyaworks.in
         └── stmary.campus.acharyaworks.in
```

---

## 🚀 Key Features

* **Multi-Tenant Routing**: Instant subdomain allocation and strict database query isolation per school tenant.
* **Role-Based Access Control (RBAC)**: Dedicated dashboards for School Admins, Teachers, Students, and Accountants.
* **Automated Attendance**: Binary Roll Call, 1st-period submission lock, and instant guardian absentee HTML email alerts.
* **Online Fee Automation**: Tiered fee structures, partial/full payment recording, and instant receipt generator.
* **Digital Gradebook**: Class marks entry, auto-calculated term percentages, and 1-click printable Report Cards.
* **Conflict-Free Timetable**: Interactive periods manager with teacher allocation and subject mapping.