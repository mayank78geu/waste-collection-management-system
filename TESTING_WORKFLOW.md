# WCMS — End-to-End Testing & Demonstration Workflow

This document provides a step-by-step workflow designed to help teammates or mentors test the entire Waste Collection Management System (WCMS) from start to finish. Following these steps will demonstrate every core module and role (Admin, Supervisor, Driver, Citizen).

---

## 🔑 Default System Admin Credentials
When the backend starts up, it automatically seeds the initial System Admin account. Start your demonstration by logging in with these credentials:

- **Login URL:** `http://localhost:5173/login`
- **Email:** `admin@wcms.com`
- **Password:** `admin123`

*(Note: The frontend runs on port `5173` and the backend on `8081`.)*

---

## 🎬 Step-by-Step Demonstration Workflow

### Step 1: Admin Data Setup (Master Data Management)
*Log in as the **Admin** (`admin@wcms.com`). This role sets up the foundational data.*

1. **Create Zones:**
   - Go to **Zones** in the sidebar.
   - Click `+ Add Zone` and create at least two zones (e.g., "North Ward", "South District") with brief descriptions.
2. **Register Vehicles:**
   - Go to **Vehicles**.
   - Click `+ Register Vehicle`. Add 2-3 vehicles (e.g., Number: "UK07AB1234", Type: "Compactor", Status: `AVAILABLE`).
3. **Create Staff Accounts (Drivers & Supervisors):**
   - Go to **Users**.
   - Create one **Supervisor** user:
     - Name: "Supervisor Amit"
     - Email: "amit@wcms.com"
     - Password: "password123"
     - Role: `SUPERVISOR`
   - Create one **Driver** user:
     - Name: "Driver Rahul"
     - Email: "rahul@wcms.com"
     - Password: "password123"
     - Role: `DRIVER`
4. **Assign Staff to Zones:**
   - Go to **Staff**.
   - Click `+ Add Staff`.
   - Link "Supervisor Amit" to "North Ward" (Designation: "Area Supervisor").
   - Link "Driver Rahul" to "North Ward" (Designation: "Truck Driver").

*(The admin has successfully configured the system infrastructure! Now, switch roles.)*

---

### Step 2: Supervisor Planning & Scheduling
*Log out from Admin, and log in as the **Supervisor** (`amit@wcms.com` / `password123`).*

1. **Dashboard Overview:**
   - Notice the Supervisor Dashboard showing today's statistics (Total Schedules, Pending, Completed, Missed).
2. **Create a Schedule:**
   - Go to **Schedules** or click `Manage Schedules`.
   - Select the current date, then click `+ New Schedule`.
   - Create a morning run:
     - Time Slot: `MORNING`
     - Zone: "North Ward"
     - Vehicle: Select the one you created earlier.
     - Staff: Select "Driver Rahul".
   - Save the schedule. It will appear as `PENDING`.
   - *(Optional: Try to create another schedule with the same vehicle in the same time slot to demonstrate the conflict detection/double-booking validation).*

---

### Step 3: Driver Execution
*Log out from Supervisor, and log in as the **Driver** (`rahul@wcms.com` / `password123`).*

1. **View Assigned Tasks:**
   - The driver sees their assigned tasks for today.
   - Verify the task you just created (Morning run at North Ward) appears in the "Today" section.
2. **Complete the Task:**
   - Click the `✅ Mark Completed` button.
   - The UI will update instantly, moving the status to `COMPLETED` and updating the stat cards at the top.

*(At this point, you can briefly log back into the **Supervisor** account to show the mentor that the schedule status is now updated to Completed in real-time.)*

---

### Step 4: Public Complaints (Citizen Workflow)
*Open a new incognito window or log out. You do not need to be logged in for this step.*

1. **Submit a Complaint:**
   - Navigate to the public complaint portal: `http://localhost:5173/complaints`
   - Fill out the form (Name: "Citizen John", select "South District", write a descriptive issue like "Garbage overflowing near the park entrance").
   - Click `Submit`.
2. **Copy the Tracking Code:**
   - The success screen will generate a unique tracking code (e.g., `WCMS-2026-X8Y9Z`).
   - Click the copy button and proceed to the tracking page.
3. **Track the Complaint:**
   - Go to the tracking page (`http://localhost:5173/track`).
   - Paste the code. The timeline will show the complaint is currently `OPEN`.

---

### Step 5: Complaint Resolution (Supervisor)
*Log back into the **Supervisor** account (`amit@wcms.com`).*

1. **Review Complaints:**
   - Go to **Complaints** in the sidebar.
   - You will see the new complaint listed. You can use the top dropdowns to filter by zone or status.
2. **Update the Complaint:**
   - Click `Update` on the citizen's complaint.
   - Change the status to `IN_PROGRESS` or `RESOLVED`.
   - Add a resolution note (e.g., "Team dispatched. Area cleaned.").
   - Click `Save Changes`.

*(If you refresh the public tracking page from Step 4, the timeline will visually advance to Resolved, and the citizen will see the resolution note!)*

---

### Step 6: Admin Analytics & Reports
*Log out from Supervisor, and log back into the **Admin** account (`admin@wcms.com`).*

1. **View System Analytics:**
   - Go to the **Reports** section in the sidebar.
   - Show the mentor the live, interactive charts:
     - **Collection Status by Zone** (Stacked Bar Chart).
     - **Vehicle Fleet Status** (Donut Pie Chart).
     - **Staff Performance** (Horizontal Bar Chart showing Driver Rahul's completed task).
     - **Complaint Status Distribution** (Pie Chart).
     - **Complaints by Zone** (Bar Chart).

*(This concludes the full system demonstration!)*
