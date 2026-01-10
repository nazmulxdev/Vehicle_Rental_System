# 🚗 Vehicle Rental System – Backend API

## 🌐 Live URL

https://rentvehicles.vercel.app/

---

## 🎯 Project Overview

The **Vehicle Rental System** is a backend REST API built to manage vehicle rentals with role-based access control.  
It allows admins to manage vehicles and users, while customers can book vehicles, manage their own bookings, and update their profiles.

### Core Responsibilities

- Vehicle inventory management with availability tracking
- User authentication and role-based authorization
- Booking creation, cancellation, return, and automatic status updates
- Secure JWT-based authentication

---

## 🛠️ Technology Stack

- **Node.js**
- **TypeScript**
- **Express.js**
- **PostgreSQL**
- **bcrypt** – password hashing
- **jsonwebtoken (JWT)** – authentication
- **pg** – PostgreSQL client

---

## 📁 Project Structure (Modular Pattern)

```

src/
├── app.ts
├── server.ts
├── config/
│ ├── db.config.ts
│ └── index.ts
├── modules/
│ ├── auth/
│ │ ├── auth.controller.ts
│ │ ├── auth.service.ts
│ │ └── auth.routes.ts
│ ├── users/
│ ├── vehicles/
│ ├── bookings/
│ └── middlewares/
├── types/express
│ └── express/
│ └── index.d.ts
├── utils/
│ ├── sendResponse.ts
│ └── errorHandler.ts

✔ Feature-based
✔ Controller–Service–Route separation
✔ Clean & scalable architecture

```

---

## 📊 Database Schema

### Users Table

| Field    | Notes                 |
| -------- | --------------------- |
| id       | Auto-generated        |
| name     | Required              |
| email    | Required, unique      |
| password | Required, min 6 chars |
| phone    | Required              |
| role     | `admin` or `customer` |

### Vehicles Table

| Field               | Notes                       |
| ------------------- | --------------------------- |
| id                  | Auto-generated              |
| vehicle_name        | Required                    |
| type                | `car`, `bike`, `van`, `SUV` |
| registration_number | Required, unique            |
| daily_rent_price    | Positive                    |
| availability_status | `available` or `booked`     |

### Bookings Table

| Field           | Notes                             |
| --------------- | --------------------------------- |
| id              | Auto-generated                    |
| customer_id     | FK → Users                        |
| vehicle_id      | FK → Vehicles                     |
| rent_start_date | Required                          |
| rent_end_date   | After start date                  |
| total_price     | Calculated                        |
| status          | `active`, `cancelled`, `returned` |

---

## 🔐 Authentication & Authorization

### User Roles

- **Admin**
  - Full system access
  - Manage users, vehicles, all bookings
- **Customer**
  - Manage own profile
  - Create, cancel own bookings
  - View available vehicles

### Authentication Flow

1.  User logs in
2.  JWT token generated
3.  Token sent via header:

```
    Authorization: Bearer <token>

```

4.  Middleware validates token & role

---

## 🌐 API Endpoints

### Auth

| Method | Endpoint            | Access |
| ------ | ------------------- | ------ |
| POST   | /api/v1/auth/signup | Public |
| POST   | /api/v1/auth/signin | Public |

### Vehicles

| Method | Endpoint                    | Access |
| ------ | --------------------------- | ------ |
| POST   | /api/v1/vehicles            | Admin  |
| GET    | /api/v1/vehicles            | Public |
| GET    | /api/v1/vehicles/:vehicleId | Public |
| PUT    | /api/v1/vehicles/:vehicleId | Admin  |
| DELETE | /api/v1/vehicles/:vehicleId | Admin  |

### Users

| Method | Endpoint              | Access      |
| ------ | --------------------- | ----------- |
| GET    | /api/v1/users         | Admin       |
| PUT    | /api/v1/users/:userId | Admin / Own |
| DELETE | /api/v1/users/:userId | Admin       |

### Bookings

| Method | Endpoint                    | Access           |
| ------ | --------------------------- | ---------------- |
| POST   | /api/v1/bookings            | Admin / Customer |
| GET    | /api/v1/bookings            | Role-based       |
| PUT    | /api/v1/bookings/:bookingId | Role-based       |

---

## ❌ Deletion Constraints

- Users with **active bookings** cannot be deleted
- Vehicles with **active bookings** cannot be deleted

---

## 🚀 Setup Instructions

### 1️⃣ Clone Repository

```bash

git clone <repo-url>
cd vehicle-rental-system

```

### 2️⃣ Install Dependencies

```bash

npm install

```

### 3️⃣Configure Environment

```bash

Create .env

PORT=5000
POSTGRESQL_CONNECTION=postgresql://user:password@localhost:5432/vehiclerental
JWT_SECRET=your_secret

```

### 4️⃣ Run Project

```bash

npm run dev

```
