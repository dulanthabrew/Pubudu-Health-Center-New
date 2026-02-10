# Pubudu Health Center

A comprehensive Health Center Management System designed to streamline operations for Doctors, Patients, Receptionists, and Administrators. This web application facilitates appointment booking, user management, and schedule coordination.

## 🚀 Features

- **Role-Based Access Control**: specialized dashboards for Admin, Doctor, Patient, and Receptionist.
- **Appointment Management**:
  - Patients can book appointments with doctors.
  - Doctors can view their schedules.
  - Receptionists can manage appointments.
- **Doctor Slot Management**: Doctors can add and manage their availability slots.
- **User Management**: Admins can manage users (Doctors, Receptionists, etc.).
- **Authentication**: Secure login and registration system.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React](https://react.dev/) (Vite)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State/API**: Axios, React Hooks
- **Icons**: Lucide React

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: MySQL (using `mysql2` driver)
- **Authentication**: Custom Auth (Bcrypt)

## 📂 Project Structure

```
Pubudu-Health-Center-New/
├── backend/          # Node.js + Express Server
│   ├── server.js     # Main server entry & API routes
│   └── ...
├── frontend/         # React + Vite Client
│   ├── src/
│   │   ├── pages/    # Dashboards & Auth Pages
│   │   ├── api.js    # API service layer
│   │   └── ...
│   └── ...
└── README.md
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v14+ recommended)
- MySQL Server

### 1. Database Setup
1. Create a MySQL database named `pubudu_health`.
2. Import the necessary tables (Users, Appointments, Slots). _(Note: SQL dump not provided in repo, ensure tables match `server.js` queries)_

### 2. Backend Setup
```bash
cd backend
npm install
# Configure database credentials in server.js if needed (default: root/no-password)
node server.js
```
Server will run on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Client will run on the Vite default port (usually `http://localhost:5173`).

## 📡 API Endpoints

### Auth
- `POST /api/login` - User login
- `POST /api/register` - User registration

### Users
- `GET /api/users` - Get users by role
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user

### Appointments
- `GET /api/appointments` - Get appointments (filter by role)
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update status

### Slots
- `POST /api/slots` - Add availability slot
- `GET /api/slots/:doctorId` - Get doctor's slots
- `DELETE /api/slots/:id` - Remove slot

## 👥 Contributors
- Dulan Thabrew (Author)