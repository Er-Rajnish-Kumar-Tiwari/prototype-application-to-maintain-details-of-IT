# IT Asset Management System (Prototype)

Ek full-stack MERN application jo kisi organization ke IT assets (laptops, printers,
servers, etc.) ko track karne ke liye banayi gayi hai — approval workflow, dashboard,
search/filters aur Excel/CSV export ke saath.

## Tech Stack

- **Frontend:** React (Vite) + Tailwind CSS + React Router + Recharts + Axios
- **Backend:** Node.js + Express + Mongoose
- **Database:** MongoDB (Atlas or local)
- **Auth:** JWT (JSON Web Tokens)

## Features

- 🔐 Role-based login — **Head of Organization (admin)** and **Department Staff**
- 📦 Add / Edit / Delete IT assets (asset number, name, make/model, serial no,
  location, assigned user, department, purchase date, warranty, status)
- ✅ **Approval workflow** — any add/edit/delete raised by department staff goes to
  the Head of Organization as a pending request; only after approval is the change
  applied. Admin actions apply instantly.
- 🔍 Full-text search (asset number, name, serial number, assigned user)
- 🧰 Filters by location, status, type and department
- 📊 Dashboard — total assets, status breakdown (pie chart), department breakdown
  (bar chart), warranty alerts, recent assets, pending approvals count
- ⏰ Warranty expiry alerts — daily background job + on-demand dashboard widget
  flags assets that are expiring within 30 days or already expired
- 🔔 In-app notification bell for approval requests / decisions / warranty alerts
- 📤 Export the (filtered) asset list to **CSV** or **Excel (.xlsx)**
- 🏢 Department management
- 👥 User management (Head of Organization only)

## Project Structure

```
├── server/          Express + MongoDB REST API
│   └── src/
│       ├── config/        DB connection
│       ├── models/        Mongoose schemas
│       ├── controllers/   Route handlers / business logic
│       ├── routes/        Express routers
│       ├── middleware/    Auth + error handling
│       ├── jobs/          Warranty expiry cron job
│       └── seed/          Seed script (admin user, departments, sample assets)
└── client/           React (Vite) + Tailwind frontend
    └── src/
        ├── api/            Axios instance
        ├── context/        Auth context
        ├── components/     Reusable UI, layout, asset & approval widgets
        └── pages/          Route-level pages
```

## Getting Started

### 1. Backend setup

```bash
cd server
npm install
copy .env.example .env      # Windows (PowerShell: Copy-Item .env.example .env)
```

Ab `server/.env` file kholen aur apna asli MongoDB connection string daalein:

```
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/it-asset-manager
```

> ⚠️ **Important:** Real password hamesha `server/.env` me hi daalein — `.env.example`
> ek template file hai jo git me commit hoti hai, usme kabhi real secret na rakhein.

Phir database ko seed karein (ek Head of Organization admin account, kuch departments
aur sample assets bana dega):

```bash
npm run seed
```

Server start karein:

```bash
npm run dev
```

API `http://localhost:5000/api` par chalega.

**Default login credentials (seed ke baad):**

| Role                  | Email               | Password  |
| ---------------------- | -------------------- | --------- |
| Head of Organization   | admin@company.com    | Admin@123 |
| Department Staff       | staff@company.com    | Staff@123 |

### 2. Frontend setup

```bash
cd client
npm install
copy .env.example .env
npm run dev
```

App `http://localhost:5173` par khulega.

## Approval Workflow (how it works)

1. Department staff jab koi asset add/edit/delete karta hai, us change ko turant
   apply nahi kiya jaata — ek `ApprovalRequest` record banta hai (status: Pending)
   aur Head of Organization ko notification jaati hai.
2. Head of Organization **Approvals** page par jaakar request ko **Approve** ya
   **Reject** kar sakta hai (reject karte waqt reason bhi likha ja sakta hai).
3. Approve karne par change asset collection me apply ho jaata hai; requester ko
   decision ka notification milta hai.
4. Head of Organization ke apne actions (create/update/delete) bina approval ke
   turant apply ho jaate hain.

## Notes

- Asset numbers unique hone chahiye (e.g. `AST-0001`).
- CSV/Excel export current filters ko respect karta hai — jo table me dikh raha hai
  wahi export hota hai.
- Warranty check job har din 07:00 (server time) par chalta hai + server start hote
  hi ek baar turant chalta hai.
