# Smart Complaint Management System (MERN Stack)

A role-based complaint management system built with MongoDB, Express.js, React.js and Node.js,
matching the system design: single login page, admin approval workflow, role-based dashboards,
and full complaint lifecycle tracking.

## Features

- **Single common login page** for both Users/Students and Admins
- **Registration with admin approval**: new accounts start as `PENDING` and cannot log in
  until an admin approves them (`ACTIVE`)
- **Account status checks** on login: `PENDING` / `DEACTIVATED` / `REJECTED` → Access Denied
- **Role-based routing**: after login, users are routed to the User Dashboard or Admin Dashboard
- **User Dashboard**: submit complaints, track status (Pending → In Progress → Resolved/Rejected)
- **Admin Dashboard**:
  - *Manage Users*: view pending users, approve/reject, activate/deactivate, manage roles
  - *Manage Complaints*: view all complaints, search, filter, view details, update status
- **Security**: JWT authentication, bcrypt password hashing, authorization middleware,
  role-based access control, and protected frontend routes

## Tech Stack

| Layer     | Technology              |
|-----------|--------------------------|
| Frontend  | React.js, React Router   |
| Backend   | Node.js, Express.js      |
| Database  | MongoDB (Mongoose ODM)   |
| Auth      | JSON Web Tokens, bcrypt  |

## Project Structure

```
complaint-management-system/
├── backend/
│   ├── config/
│   │   ├── db.js            # MongoDB connection
│   │   └── seedAdmin.js     # creates the initial admin account
│   ├── middleware/
│   │   ├── auth.js          # JWT authentication
│   │   └── role.js          # role-based authorization
│   ├── models/
│   │   ├── User.js
│   │   ├── Complaint.js
│   │   └── Category.js
│   ├── routes/
│   │   ├── auth.js          # register / login / me
│   │   ├── users.js         # admin: manage users
│   │   └── complaints.js    # submit / track / manage complaints
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── public/index.html
    └── src/
        ├── api/axios.js
        ├── context/AuthContext.js
        ├── components/ProtectedRoute.js
        ├── pages/
        │   ├── Login.js
        │   ├── Register.js
        │   ├── UserDashboard.js
        │   ├── AdminDashboard.js
        │   ├── ManageUsers.js
        │   └── ManageComplaints.js
        ├── App.js / App.css
        └── index.js / index.css
```

## Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB running locally or a MongoDB Atlas connection string

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env with your MongoDB URI, JWT secret, and desired admin credentials

npm run seed:admin   # creates the initial ADMIN account
npm run dev          # starts the API on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# REACT_APP_API_URL should point to your backend, e.g. http://localhost:5000/api

npm start            # starts the app on http://localhost:3000
```

### 3. Try it out

1. Open the frontend and register a new user — it will be created with `status: pending`.
2. Log in with the seeded admin account, go to **Manage Users**, and **Approve** the new user.
3. Log out and log back in as that user — you'll land on the **User Dashboard**.
4. Submit a complaint, then switch back to the admin account to review it under
   **Manage Complaints**, update its status, and add admin notes.

## API Overview

| Method | Endpoint                       | Access        | Description                     |
|--------|---------------------------------|---------------|----------------------------------|
| POST   | /api/auth/register              | Public        | Register (status = pending)      |
| POST   | /api/auth/login                 | Public        | Login (checks status + role)     |
| GET    | /api/auth/me                    | Authenticated | Current user profile             |
| GET    | /api/users/pending               | Admin         | List pending users                |
| GET    | /api/users                       | Admin         | List/search/filter users          |
| PUT    | /api/users/:id/approve           | Admin         | Approve a pending user            |
| PUT    | /api/users/:id/reject             | Admin         | Reject a pending user             |
| PUT    | /api/users/:id/status             | Admin         | Activate/deactivate a user        |
| PUT    | /api/users/:id/role               | Admin         | Change a user's role              |
| POST   | /api/complaints                  | User          | Submit a complaint                |
| GET    | /api/complaints/my                | User          | Track own complaints              |
| GET    | /api/complaints                  | Admin         | View/search/filter all complaints |
| GET    | /api/complaints/:id                | Owner/Admin   | View complaint details            |
| PUT    | /api/complaints/:id/status          | Admin         | Update complaint status/notes     |

## Notes

- This project deliberately mirrors the provided system flowchart: login gating on account
  status, role-based dashboard routing, admin approval before dashboard access, and the full
  complaint lifecycle (Pending → In Progress → Resolved/Rejected).
- Password hashing uses bcrypt; sessions use stateless JWTs stored in `localStorage`.
- For production use, add HTTPS, refresh tokens, rate limiting, and input validation libraries
  (e.g. `express-validator`) before deploying.
