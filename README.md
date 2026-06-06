# L'Espoir — School Management App

Bilingual (FR/AR) MERN stack management app for the L'Espoir private tutoring center.

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm

---

## Setup

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
# Edit .env: set MONGODB_URI and JWT_SECRET
npm run seed        # Creates admin: admin@espoir.tn / admin123
npm run dev         # Starts on port 5000
```

### 2. Frontend

```bash
cd client
npm install
npm run dev         # Starts on port 5173
```

Open http://localhost:5173

---

## Default credentials

| Role  | Email              | Password  |
|-------|--------------------|-----------|
| Admin | admin@espoir.tn    | admin123  |

**Change the admin password after first login!**

---

## Features

### Admin
- **Dashboard** — 4 stat cards + unpaid students list with one-click payment
- **Teachers** — Full CRUD, teacher accounts with subject & phone
- **Groups** — Card grid with level/schedule/price, click to manage
- **Group Detail** — 3 tabs: Students (add/remove), Sessions (4/month max, attendance), Payments (toggle paid)
- **Students** — Table with search, click for full detail
- **Student Detail** — Info + attendance stats + full payment history
- **Payments** — Month picker, toggle paid/unpaid, revenue summary

### Teacher
- **My Groups** — Cards of assigned groups
- **Group Detail** — Sessions tab (touch-friendly attendance checklist) + Students tab
- **Profile** — View info + change password

### Bilingual
- Toggle FR ↔ عر in the navbar
- Arabic switches to RTL layout automatically
- Preference saved in localStorage

---

## Project Structure

```
espoirschooladmins/
├── server/
│   ├── models/          User, Group, Student, Session, Payment
│   ├── controllers/     One per resource
│   ├── routes/          auth, users, groups, students, sessions, payments, dashboard
│   ├── middleware/       auth, adminOnly, error
│   ├── scripts/         seed.js
│   └── server.js
└── client/
    └── src/
        ├── pages/
        │   ├── admin/   Dashboard, Teachers, Groups, GroupDetail, Students, StudentDetail, Payments
        │   └── teacher/ Home, GroupDetail, Profile
        ├── components/  AdminLayout, TeacherLayout, Sidebar, Navbar, Modal, Toast, StatCard, ConfirmDialog
        ├── context/     AuthContext, LanguageContext, ToastContext
        ├── api/         axios.ts + index.ts
        ├── data/        translations.ts (FR + AR)
        └── types/       index.ts
```

## API

```
POST  /api/auth/login
GET   /api/auth/me
GET   /api/users                  (admin)
POST  /api/users                  (admin)
PUT   /api/users/:id              (admin)
DELETE /api/users/:id             (admin)
GET   /api/groups                 (admin: all | teacher: own)
POST  /api/groups                 (admin)
PUT   /api/groups/:id             (admin)
DELETE /api/groups/:id            (admin)
POST  /api/groups/:id/students    (admin)
DELETE /api/groups/:id/students/:studentId (admin)
GET   /api/students               (admin: all | teacher: own)
POST  /api/students               (admin)
PUT   /api/students/:id           (admin)
DELETE /api/students/:id          (admin)
GET   /api/sessions/group/:id
POST  /api/sessions
GET   /api/payments
POST  /api/payments/generate
PUT   /api/payments/:id
GET   /api/payments/history/:studentId
GET   /api/dashboard              (admin)
```
