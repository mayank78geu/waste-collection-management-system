# Waste Collection Management System (WCMS)
## Product Requirements Document & Step-by-Step Development Guide

> **SDLC Model:** Evolutionary (Incremental)
> **Primary Goal:** Deliver a minimum working system as fast as possible so operations can begin, then layer in advanced features.
> **Stack:** React.js · Spring Boot · MySQL

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Goals & Success Metrics](#2-goals--success-metrics)
3. [User Roles & Permissions](#3-user-roles--permissions)
4. [Functional Requirements](#4-functional-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Data Model](#6-data-model)
7. [Evolutionary Increments — Release Plan](#7-evolutionary-increments--release-plan)
8. [Step-by-Step Development Guide](#8-step-by-step-development-guide)
9. [API Contract (Key Endpoints)](#9-api-contract-key-endpoints)
10. [Risk Register](#10-risk-register)
11. [Definition of Done (Per Increment)](#11-definition-of-done-per-increment)

---

## 1. Product Overview

**WCMS** is a web-based application that replaces manual coordination in municipal waste collection with a structured, data-driven workflow. It enables supervisors to schedule pickups, drivers to execute and update task status, citizens to raise complaints, and admins to monitor everything through dashboards and reports.

### Core Problem Being Solved

| Current Pain | WCMS Solution |
|---|---|
| Manual scheduling via phone/paper | Digital schedule creation & assignment |
| No real-time task status visibility | Driver-updated status: Pending / Completed / Missed |
| Complaints lost or untracked | Complaint portal with tracking & resolution flow |
| No performance data | Zone-wise reports & vehicle utilization analytics |

---

## 2. Goals & Success Metrics

| Goal | Metric |
|---|---|
| System live for operations | Increment 1 deployed within target sprint |
| Supervisor can create & assign schedules | Schedule CRUD working end-to-end |
| Driver can update task status | Status update API integrated in UI |
| Admin can see operational dashboard | Dashboard renders real data |
| Citizens can log complaints | Complaint submission & status tracking live |

---

## 3. User Roles & Permissions

| Role | Key Capabilities |
|---|---|
| **Administrator** | Full system access; manage users, zones, vehicles, staff; view all reports |
| **Supervisor** | Create/edit schedules; assign vehicles & staff; view operational dashboard |
| **Driver / Collector** | View assigned tasks; update collection status (Completed / Missed) |
| **Citizen** *(Optional — Increment 3)* | Register complaints; track complaint status |

> **Access Control Model:** Role-Based Access Control (RBAC). JWT tokens carry role claims. Backend validates role on every protected endpoint.

---

## 4. Functional Requirements

### FR-01 · Authentication & Authorization
- Users log in with email + password
- Passwords hashed with BCrypt
- JWT issued on login; sent as Bearer token on subsequent requests
- Each role sees only its permitted UI sections and API routes
- Logout invalidates session (token blacklist or short expiry + refresh)

### FR-02 · Master Data Management
- **Zones/Wards:** Create, read, update, delete; each has a name and geographic identifier
- **Vehicles:** Register vehicles with ID, type, current status (Available / In Use / Under Maintenance)
- **Staff:** Register staff with ID, name, role (Driver, Helper), contact info

### FR-03 · Scheduling & Assignment
- Supervisor creates a schedule entry: Zone + Vehicle + Staff + Date + Time Slot
- System validates no double-booking (same vehicle or staff on same date/time)
- Schedules visible on a calendar/list view in Supervisor dashboard
- Driver sees their own assigned schedule for the day

### FR-04 · Collection Status Tracking
- Driver updates status of each assigned task: `Pending → Completed` or `Pending → Missed`
- Supervisor sees live status on their dashboard
- Missed collections are flagged for rescheduling

### FR-05 · Complaint Management *(Increment 3)*
- Citizen submits: Zone, description, optional photo
- Complaint assigned a tracking ID; status: `Open → In Progress → Resolved`
- Supervisor can update complaint status and add resolution notes
- Citizen can check status using tracking ID (no login required)

### FR-06 · Reporting *(Increment 3)*
- Zone-wise collection completion rate
- Vehicle utilization report (days used vs. available)
- Staff performance (tasks completed vs. missed)
- Date-range filter on all reports
- Export to PDF/CSV *(nice to have)*

---

## 5. Non-Functional Requirements

| Category | Requirement | Implementation Note |
|---|---|---|
| **Performance** | API response ≤ 2 seconds under normal load | Index foreign keys; paginate list APIs |
| **Security** | Password hashing, HTTPS, JWT auth | BCrypt + Spring Security + SSL on deployment |
| **Usability** | Responsive UI, works on desktop & tablet | React with responsive layout (Tailwind or MUI) |
| **Reliability** | 99% uptime target | Graceful error handling; health check endpoint |
| **Maintainability** | Modular backend services; clean separation of concerns | Service layer pattern in Spring Boot |
| **Scalability** | Designed to handle multiple zones/cities | Stateless backend; DB connection pooling |

---

## 6. Data Model

### Entity Definitions

```
User
  user_id       INT PK AUTO_INCREMENT
  name          VARCHAR(100)
  email         VARCHAR(100) UNIQUE NOT NULL
  password_hash VARCHAR(255) NOT NULL
  role          ENUM('ADMIN', 'SUPERVISOR', 'DRIVER', 'CITIZEN')
  created_at    TIMESTAMP DEFAULT NOW()

Zone
  zone_id       INT PK AUTO_INCREMENT
  zone_name     VARCHAR(100) NOT NULL
  description   TEXT

Vehicle
  vehicle_id    INT PK AUTO_INCREMENT
  vehicle_number VARCHAR(20) UNIQUE NOT NULL
  type          VARCHAR(50)
  status        ENUM('AVAILABLE', 'IN_USE', 'MAINTENANCE') DEFAULT 'AVAILABLE'

Staff
  staff_id      INT PK AUTO_INCREMENT
  user_id       INT FK → User(user_id)
  zone_id       INT FK → Zone(zone_id) NULLABLE
  designation   VARCHAR(50)

Schedule
  schedule_id   INT PK AUTO_INCREMENT
  zone_id       INT FK → Zone(zone_id)
  vehicle_id    INT FK → Vehicle(vehicle_id)
  staff_id      INT FK → Staff(staff_id)
  date          DATE NOT NULL
  time_slot     VARCHAR(20)   -- e.g. "08:00-10:00"
  status        ENUM('PENDING', 'COMPLETED', 'MISSED') DEFAULT 'PENDING'
  created_by    INT FK → User(user_id)
  created_at    TIMESTAMP DEFAULT NOW()
  UNIQUE (vehicle_id, date, time_slot)   -- prevent double booking
  UNIQUE (staff_id, date, time_slot)

Complaint
  complaint_id  INT PK AUTO_INCREMENT
  tracking_code VARCHAR(20) UNIQUE NOT NULL  -- e.g. WCMS-2024-00042
  user_id       INT FK → User(user_id) NULLABLE
  zone_id       INT FK → Zone(zone_id)
  description   TEXT
  status        ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED') DEFAULT 'OPEN'
  resolution    TEXT
  created_at    TIMESTAMP DEFAULT NOW()
  updated_at    TIMESTAMP ON UPDATE NOW()
```

### Relationships

```
Zone        ──< Schedule    (1 Zone has many Schedules)
Vehicle     ──< Schedule    (1 Vehicle in many Schedules)
Staff       ──< Schedule    (1 Staff in many Schedules)
User        ──< Complaint   (1 User logs many Complaints)
Zone        ──< Complaint   (1 Zone has many Complaints)
User        ──< Staff       (1 User has 1 Staff profile)
```

---

## 7. Evolutionary Increments — Release Plan

> The Evolutionary Model means each increment is a **fully working, deployable version** of the system — not a prototype. Each release builds on the last.

---

### 🟢 INCREMENT 1 — "Get the System Running"
**Goal:** Minimum working system. Authentication is live, admin can manage master data, system is deployed.

**Target Duration:** Sprint 1–2 (≈ 2–3 weeks)

| Module | Features Included |
|---|---|
| Authentication | Login (all roles), JWT issue, role-based routing |
| User Management | Admin can create/edit/delete users and assign roles |
| Zone Management | Admin can create/edit/delete zones |
| Vehicle Management | Admin can register/edit vehicles |
| Staff Management | Admin can register staff, link to User account |
| Admin Dashboard | Counts: total zones, vehicles, staff, users |
| DB Setup | All tables created; seed data for 1 admin account |

**Deliverable:** Running system where an admin can log in, configure zones, vehicles, and staff. Foundation is solid for next increment.

**Not Included:** Scheduling, tracking, complaints, reports.

---

### 🔵 INCREMENT 2 — "Operations Start"
**Goal:** Supervisors can schedule collections. Drivers can see tasks and update status. This is the core operational loop.

**Target Duration:** Sprint 3–4 (≈ 2–3 weeks after Increment 1)

| Module | Features Included |
|---|---|
| Schedule Management | Supervisor creates/edits/deletes schedules; assigns vehicle + staff |
| Double-Booking Prevention | Backend validation on vehicle+date+timeslot and staff+date+timeslot |
| Supervisor Dashboard | View today's schedules, status overview (Pending/Completed/Missed counts) |
| Driver Dashboard | Driver sees their own schedule for today and upcoming days |
| Status Update | Driver marks a task as Completed or Missed |
| Missed Flag | Missed tasks highlighted on Supervisor dashboard |

**Deliverable:** A fully operational system. Supervisors can plan collections, drivers can execute, and status flows back in real time.

**Not Included:** Complaint management, reporting module, analytics.

---

### 🟣 INCREMENT 3 — "Citizen Interaction & Reporting"
**Goal:** Add complaint management for citizens and reporting/analytics for management.

**Target Duration:** Sprint 5–6 (≈ 2–3 weeks after Increment 2)

| Module | Features Included |
|---|---|
| Complaint Registration | Citizen submits complaint (with or without login) |
| Complaint Tracking | Citizen tracks status via tracking code |
| Complaint Resolution | Supervisor updates status, adds resolution notes |
| Reports – Collection | Zone-wise completion rate; filterable by date range |
| Reports – Vehicle | Utilization by vehicle over time |
| Reports – Staff | Completed vs. Missed counts per staff member |
| Export *(stretch)* | PDF or CSV export of reports |

**Deliverable:** Complete WCMS with full citizen interaction and management visibility into operational performance.

---

### Increment Timeline Summary

```
Week 1-3    [INCREMENT 1]  Auth + Master Data + Admin Dashboard
                            ↓ Deploy & Test
Week 4-6    [INCREMENT 2]  Scheduling + Assignment + Driver Tracking
                            ↓ Deploy & Test
Week 7-9    [INCREMENT 3]  Complaints + Reports + Analytics
                            ↓ Final Release
```

---

## 8. Step-by-Step Development Guide

### Phase 0 — Project Setup (Day 1-2, Before Any Coding)
**Step 0: Create the project folder structure as per the given structure.**
wcms-backend/
├── src/
│   └── main/
│       ├── java/
│       │   └── com/wcms/
│       │       ├── WcmsApplication.java          ← main class
│       │       │
│       │       ├── config/
│       │       │   ├── SecurityConfig.java
│       │       │   └── CorsConfig.java
│       │       │
│       │       ├── controller/
│       │       │   ├── AuthController.java
│       │       │   ├── ZoneController.java
│       │       │   ├── VehicleController.java
│       │       │   ├── StaffController.java
│       │       │   ├── ScheduleController.java
│       │       │   └── ComplaintController.java
│       │       │
│       │       ├── service/
│       │       │   ├── AuthService.java
│       │       │   ├── ZoneService.java
│       │       │   ├── VehicleService.java
│       │       │   ├── StaffService.java
│       │       │   ├── ScheduleService.java
│       │       │   └── ComplaintService.java
│       │       │
│       │       ├── repository/
│       │       │   ├── UserRepository.java
│       │       │   ├── ZoneRepository.java
│       │       │   ├── VehicleRepository.java
│       │       │   ├── StaffRepository.java
│       │       │   ├── ScheduleRepository.java
│       │       │   └── ComplaintRepository.java
│       │       │
│       │       ├── entity/
│       │       │   ├── User.java
│       │       │   ├── Zone.java
│       │       │   ├── Vehicle.java
│       │       │   ├── Staff.java
│       │       │   ├── Schedule.java
│       │       │   └── Complaint.java
│       │       │
│       │       ├── dto/
│       │       │   ├── LoginRequest.java
│       │       │   ├── LoginResponse.java
│       │       │   ├── ScheduleRequest.java
│       │       │   └── ComplaintRequest.java
│       │       │
│       │       ├── security/
│       │       │   ├── JwtUtil.java
│       │       │   ├── JwtFilter.java
│       │       │   └── UserDetailsServiceImpl.java
│       │       │
│       │       └── common/
│       │           └── ApiResponse.java
│       │
│       └── resources/
│           ├── application.properties        ← GITIGNORED
│           └── application.properties.example
│
├── .gitignore
└── pom.xml

wcms-frontend/
├── src/
│   ├── api/
│   │   └── axios.js                  ← base axios instance with JWT header
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── components/
│   │   └── PrivateRoute.jsx
│   │
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── ZoneManagement.jsx
│   │   │   ├── VehicleManagement.jsx
│   │   │   ├── StaffManagement.jsx
│   │   │   └── UserManagement.jsx
│   │   ├── supervisor/
│   │   │   ├── SupervisorDashboard.jsx
│   │   │   └── ScheduleManagement.jsx
│   │   ├── driver/
│   │   │   └── DriverDashboard.jsx
│   │   └── public/
│   │       ├── ComplaintForm.jsx
│   │       └── TrackComplaint.jsx
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── .env                              ← GITIGNORED (store API base URL)
├── .env.example
└── package.json

**Step 1: Repository Setup**
- Create two separate GitHub repos: `wcms-frontend` and `wcms-backend`
- Branch strategy for each: `main` (production), `dev` (integration), `feature/xxx` (feature branches)
- Never work directly on `main`; merge via Pull Requests from `dev`

**Step 2: Backend Bootstrap (Spring Boot)**
```
1. Go to start.spring.io
2. Add dependencies: Spring Web, Spring Security, Spring Data JPA, MySQL Driver, Lombok, Validation
3. Set Java version to 17 or 21
4. Download, unzip, open in IDE
```

Create `application.properties` (GITIGNORE THIS FILE):
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/wcms_db
spring.datasource.username=your_db_user
spring.datasource.password=your_db_password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
jwt.secret=your_super_secret_key_min_256_bits
jwt.expiration=86400000
```

Add `application.properties` to `.gitignore` immediately. Use `application.properties.example` with placeholder values for teammates.

**Step 3: Frontend Bootstrap (React)**
```bash
npx create-react-app wcms-frontend
# OR (preferred for speed)
npm create vite@latest wcms-frontend -- --template react
cd wcms-frontend
npm install axios react-router-dom
# Optional but recommended:
npm install @mui/material @emotion/react @emotion/styled
```

**Step 4: Database Setup**
```sql
CREATE DATABASE wcms_db;
CREATE USER 'wcms_user'@'localhost' IDENTIFIED BY 'strongpassword';
GRANT ALL PRIVILEGES ON wcms_db.* TO 'wcms_user'@'localhost';
FLUSH PRIVILEGES;
```

**Step 5: Define Standard API Response Wrapper**

Create `ApiResponse.java` — agree on this with your teammate on Day 1. Every endpoint returns this shape:
```java
@Data
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, "Success", data);
    }
    public static <T> ApiResponse<T> error(String msg) {
        return new ApiResponse<>(false, msg, null);
    }
}
```

---

### Phase 1 — Increment 1 Development

**Step 6: Create Database Entities (JPA)**

Order: User → Zone → Vehicle → Staff (no dependencies first)

```java
// Example: User.java
@Entity
@Table(name = "users")
@Data
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer userId;
    private String name;
    @Column(unique = true, nullable = false)
    private String email;
    private String passwordHash;
    @Enumerated(EnumType.STRING)
    private Role role;  // ADMIN, SUPERVISOR, DRIVER, CITIZEN
}
```

Repeat the same pattern for `Zone.java`, `Vehicle.java`, `Staff.java`.

**Step 7: Spring Security + JWT**

1. Add `JwtUtil.java` — generates and validates JWT tokens
2. Add `JwtFilter.java` — intercepts each request, extracts token, sets SecurityContext
3. Add `SecurityConfig.java` — configure which routes are public vs. protected
4. Permit `/api/auth/**` without authentication; protect everything else

Public endpoints:
- `POST /api/auth/login`

Protected endpoints:
- Everything under `/api/admin/**` — ADMIN only
- `/api/schedules/**` — SUPERVISOR, ADMIN
- `/api/tasks/**` — DRIVER

**Step 8: Auth Endpoints**
```
POST /api/auth/login
  Body: { email, password }
  Response: { token, role, name }
```

**Step 9: Master Data CRUD APIs**

For each entity (Zone, Vehicle, Staff, User), create:
- `Repository` (extends JpaRepository)
- `Service` (business logic layer)
- `Controller` (REST endpoints)

Endpoints per entity:
```
GET    /api/zones          → list all
POST   /api/zones          → create
PUT    /api/zones/{id}     → update
DELETE /api/zones/{id}     → delete
```

Apply `@PreAuthorize("hasRole('ADMIN')")` on all admin-only controllers.

**Step 10: Admin Dashboard Endpoint**
```
GET /api/admin/dashboard/summary
Response: { totalZones, totalVehicles, totalStaff, totalUsers }
```

Implement as a simple aggregation query across all tables.

**Step 11: Frontend — Auth Flow**
1. Build `Login.jsx` — form with email/password, calls `POST /api/auth/login`
2. Store JWT in `localStorage` (or better: `httpOnly` cookie via proxy)
3. Create `AuthContext` — provides `user`, `token`, `logout` across app
4. Create `PrivateRoute` component — redirects to `/login` if not authenticated
5. Add role-based redirect: Admin → `/admin/dashboard`, Supervisor → `/supervisor/dashboard`, Driver → `/driver/dashboard`

**Step 12: Frontend — Admin Pages**
Build one entity at a time in this order:
1. `ZoneManagement.jsx` — list, add, edit, delete zones
2. `VehicleManagement.jsx` — list, add, edit, delete vehicles
3. `StaffManagement.jsx` — list, add, edit, delete staff
4. `UserManagement.jsx` — list, create users, assign roles
5. `AdminDashboard.jsx` — summary cards (total zones, vehicles, staff, users)

Pattern for each page: fetch data on mount → display in table → modal/drawer for add/edit → confirm dialog for delete.

**Step 13: Test Increment 1**
- [ ] Admin can log in and see dashboard
- [ ] Admin can create a zone
- [ ] Admin can register a vehicle
- [ ] Admin can register a staff member
- [ ] Non-admin cannot access admin routes (returns 403)
- [ ] Invalid credentials return proper error

**→ DEPLOY INCREMENT 1 ←**

---

### Phase 2 — Increment 2 Development

**Step 14: Schedule Entity & API**

```java
@Entity
@Table(name = "schedules",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"vehicle_id", "date", "time_slot"}),
        @UniqueConstraint(columnNames = {"staff_id", "date", "time_slot"})
    })
public class Schedule {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer scheduleId;
    @ManyToOne private Zone zone;
    @ManyToOne private Vehicle vehicle;
    @ManyToOne private Staff staff;
    private LocalDate date;
    private String timeSlot;
    @Enumerated(EnumType.STRING)
    private ScheduleStatus status; // PENDING, COMPLETED, MISSED
    @ManyToOne private User createdBy;
}
```

**Step 15: Schedule Endpoints**
```
POST   /api/schedules              → create (SUPERVISOR)
GET    /api/schedules?date=...     → list by date (SUPERVISOR)
GET    /api/schedules/my?date=...  → list for logged-in driver (DRIVER)
PUT    /api/schedules/{id}/status  → update status (DRIVER)
DELETE /api/schedules/{id}         → cancel (SUPERVISOR)
```

**Step 16: Double-Booking Validation (Backend)**

In `ScheduleService.createSchedule()`:
```java
boolean vehicleConflict = scheduleRepo
    .existsByVehicleAndDateAndTimeSlot(vehicle, date, timeSlot);
boolean staffConflict = scheduleRepo
    .existsByStaffAndDateAndTimeSlot(staff, date, timeSlot);
if (vehicleConflict) throw new ConflictException("Vehicle already assigned at this time");
if (staffConflict)   throw new ConflictException("Staff already assigned at this time");
```

**Step 17: Supervisor Dashboard Endpoint**
```
GET /api/supervisor/dashboard/today
Response: {
  totalScheduled, completedCount, pendingCount, missedCount,
  schedules: [{ scheduleId, zone, vehicle, staff, timeSlot, status }]
}
```

**Step 18: Frontend — Supervisor Pages**
1. `ScheduleCalendar.jsx` — date picker, list of schedules for selected date
2. `CreateScheduleModal.jsx` — dropdowns for zone, vehicle, staff; date + time slot picker
3. `SupervisorDashboard.jsx` — today's stats + schedule list with status badges
4. Handle conflict errors: show friendly message "Vehicle already scheduled at this time"

**Step 19: Frontend — Driver Pages**
1. `DriverDashboard.jsx` — show today's assigned tasks
2. Each task card shows: zone, time slot, current status
3. Action buttons: "Mark Completed" / "Mark Missed" → calls `PUT /api/schedules/{id}/status`
4. Status updates instantly in UI (optimistic update or re-fetch)

**Step 20: Test Increment 2**
- [ ] Supervisor can create a schedule
- [ ] System rejects double-booking (vehicle or staff)
- [ ] Supervisor dashboard shows correct counts
- [ ] Driver sees only their own tasks
- [ ] Driver can mark task as Completed or Missed
- [ ] Status change reflects on Supervisor dashboard

**→ DEPLOY INCREMENT 2 ← (Minimum Working Product — Operations Can Begin)**

---

### Phase 3 — Increment 3 Development

**Step 21: Complaint Entity & Logic**

Generate tracking code on creation:
```java
String trackingCode = "WCMS-" + Year.now().getValue() + "-" + String.format("%05d", id);
```

**Complaint Endpoints:**
```
POST /api/complaints              → submit (public, no auth required)
GET  /api/complaints/track/{code} → check status (public)
GET  /api/complaints?zone=&status= → list (SUPERVISOR)
PUT  /api/complaints/{id}/status  → update status + resolution (SUPERVISOR)
```

**Step 22: Frontend — Complaint Pages**
1. `ComplaintForm.jsx` — public page at `/complaint`; zone dropdown, description textarea, submit → show tracking code
2. `TrackComplaint.jsx` — public page at `/track`; enter tracking code → show status, resolution notes
3. `ComplaintManagement.jsx` (Supervisor) — filter by zone/status; update status; add resolution

**Step 23: Reporting Endpoints**
```
GET /api/reports/collection?startDate=&endDate=&zoneId=
GET /api/reports/vehicle-utilization?startDate=&endDate=
GET /api/reports/staff-performance?startDate=&endDate=
```

Implement using JPQL aggregate queries or native MySQL queries:
```sql
-- Zone completion rate example
SELECT z.zone_name,
       COUNT(*) as total,
       SUM(CASE WHEN s.status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
       ROUND(SUM(CASE WHEN s.status = 'COMPLETED' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as rate
FROM schedules s JOIN zones z ON s.zone_id = z.zone_id
WHERE s.date BETWEEN :startDate AND :endDate
GROUP BY z.zone_id, z.zone_name;
```

**Step 24: Frontend — Reports**
1. `CollectionReport.jsx` — date range picker + zone filter; table or bar chart
2. `VehicleReport.jsx` — utilization table per vehicle
3. `StaffReport.jsx` — performance table per staff member
4. Use `recharts` or `chart.js` for visual charts

**Step 25: Final Testing Checklist**
- [ ] Citizen can submit complaint and get tracking code
- [ ] Citizen can track complaint by code
- [ ] Supervisor can update complaint status
- [ ] Reports load for any date range
- [ ] All three report types return accurate data
- [ ] No 500 errors on edge cases (empty date ranges, zones with no schedules)

**→ DEPLOY INCREMENT 3 ← (Full System)**

---

## 9. API Contract (Key Endpoints)

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/zones` | Admin | List all zones |
| POST | `/api/zones` | Admin | Create zone |
| PUT | `/api/zones/{id}` | Admin | Update zone |
| DELETE | `/api/zones/{id}` | Admin | Delete zone |
| GET | `/api/vehicles` | Admin | List all vehicles |
| POST | `/api/vehicles` | Admin | Register vehicle |
| GET | `/api/staff` | Admin | List all staff |
| POST | `/api/staff` | Admin | Register staff |
| GET | `/api/admin/dashboard/summary` | Admin | Dashboard counts |
| POST | `/api/schedules` | Supervisor | Create schedule |
| GET | `/api/schedules?date=` | Supervisor | Schedules by date |
| GET | `/api/schedules/my?date=` | Driver | Driver's own tasks |
| PUT | `/api/schedules/{id}/status` | Driver | Update task status |
| GET | `/api/supervisor/dashboard/today` | Supervisor | Today's summary |
| POST | `/api/complaints` | Public | Submit complaint |
| GET | `/api/complaints/track/{code}` | Public | Track by code |
| GET | `/api/complaints` | Supervisor | List complaints |
| PUT | `/api/complaints/{id}/status` | Supervisor | Resolve complaint |
| GET | `/api/reports/collection` | Admin/Supervisor | Collection report |
| GET | `/api/reports/vehicle-utilization` | Admin/Supervisor | Vehicle report |
| GET | `/api/reports/staff-performance` | Admin/Supervisor | Staff report |

---

## 10. Risk Register

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Time slippage on Increment 1 | High | Medium | Start with auth + one CRUD entity to build momentum; don't gold-plate UI early |
| Double-booking bugs in production | High | Low | Unique DB constraints are the safety net — application-level check is secondary |
| JWT secret leaked via git | Critical | Medium | Gitignore `application.properties` from Day 1; rotate secret immediately if leaked |
| Frontend-backend API mismatch | Medium | High | Agree on `ApiResponse<T>` wrapper on Day 1; stub endpoints early with mock data |
| Load issues in deployment | Medium | Low | Add DB indexes on FK columns before deployment; test with realistic data volume |
| Scope creep into Increment 1 | Medium | High | Strictly enforce increment boundaries — complaints and reports wait for Increment 3 |

---

## 11. Definition of Done (Per Increment)

### Increment 1 is DONE when:
- All master data CRUD endpoints return correct responses
- Admin can log in, manage zones/vehicles/staff/users via UI
- JWT auth blocks unauthorized access (tested with Postman)
- Database schema is stable and seeded
- Code is pushed to `dev` branch and reviewed

### Increment 2 is DONE when:
- Supervisor can create, view, and cancel schedules
- Double-booking is rejected (both at DB and API level)
- Driver dashboard shows correct tasks for logged-in driver
- Driver can update task status and it reflects on supervisor view
- System deployed on server (even local/staging) and accessible

### Increment 3 is DONE when:
- Complaint can be submitted without login and returns tracking code
- Tracking code shows correct current status
- All three report endpoints return accurate aggregated data
- Reports visible in UI with date range filtering
- Full system tested end-to-end across all roles

---

*Document Version 1.0 — WCMS Project*
*Prepared for: Waste Collection Management System — Evolutionary Development Plan*
