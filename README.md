# ♻️ Waste Collection Management System (WCMS)

A comprehensive, full-stack solution for managing municipal waste collection, tracking vehicles, scheduling driver routes, and handling citizen complaints. Built with **Spring Boot** and **React**.

---

## 🌟 Key Features

### 👨‍💻 Admin Panel
- **Dashboard:** System-wide metrics and real-time statistics.
- **Master Data Management:** Full CRUD operations for Zones, Vehicles, Staff, and Users.
- **Reports & Analytics:** Beautiful charts (powered by Recharts) showing collection completion rates, vehicle availability, staff performance, and complaint distributions by zone.

### 👷 Supervisor Dashboard
- **Schedule Management:** Assign drivers and vehicles to specific zones for daily collections. Includes conflict detection.
- **Complaint Management:** Review, investigate, and resolve citizen complaints with status updates and resolution notes.

### 🚛 Driver Portal
- **Task Management:** View assigned collection routes for today and upcoming days.
- **Status Updates:** Mark collection tasks as "Completed" or "Missed" directly from the field.

### 🏙️ Public Portal (Citizens)
- **Report Issues:** Submit waste-related complaints (e.g., overflowing bins, missed collections) associated with specific zones.
- **Real-Time Tracking:** Receive a unique tracking code (`WCMS-YYYY-XXXXX`) to monitor the status of submitted complaints via a timeline interface.

---

## 🛠️ Technology Stack

**Backend**
- Java 17 / Spring Boot 3
- Spring Security + JWT Authentication
- Spring Data JPA + Hibernate
- MySQL Database
- Maven

**Frontend**
- React 19 (Vite)
- React Router DOM for routing
- Axios for API requests
- Recharts for data visualization
- Vanilla CSS (Custom Design System with Glassmorphism & Dark Theme)

---

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8.0+

### 1. Database Setup
1. Create a MySQL database named `wcms_db`.
2. Update the credentials in `wcms-backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/wcms_db
   spring.datasource.username=root
   spring.datasource.password=yourpassword
   ```

### 2. Backend Setup
```bash
cd wcms-backend
mvn clean install
mvn spring-boot:run
```
*Note: The backend runs on port `8081` by default. On first startup, it will automatically create the database schema and seed a default Admin user (`admin@wcms.com` / `admin123`).*

### 3. Frontend Setup
```bash
cd wcms-frontend
npm install
npm run dev
```
*The frontend will be available at `http://localhost:5173`. It is configured to proxy API requests to `http://localhost:8081`.*

---

## 🔐 Default Credentials

Upon running the backend, the `DataInitializer` will create the following default admin account:
- **Email:** `admin@wcms.com`
- **Password:** `admin123`

*(You can use this account to create additional Supervisors, Drivers, and other Admins).*

---

## 📂 Project Structure

```text
wcms/
├── wcms-backend/           # Spring Boot application
│   ├── src/main/java/.../  # Controllers, Services, Repositories, Entities, Config
│   └── src/main/resources/ # application.properties
└── wcms-frontend/          # React + Vite application
    ├── src/api/            # Axios instance with JWT interceptors
    ├── src/components/     # Shared components (Layouts, PrivateRoutes)
    ├── src/context/        # AuthContext for global state
    ├── src/pages/          # Admin, Supervisor, Driver, and Public views
    └── src/index.css       # Global design system tokens and styles
```

---

## 📄 License
This project is developed as part of an MCA academic project at Graphic Era University.
