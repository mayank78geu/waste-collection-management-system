import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AdminLayout from './components/layout/AdminLayout';

import Login from './pages/Login';
import AdminDashboard    from './pages/admin/AdminDashboard';
import ZoneManagement    from './pages/admin/ZoneManagement';
import VehicleManagement from './pages/admin/VehicleManagement';
import StaffManagement   from './pages/admin/StaffManagement';
import UserManagement    from './pages/admin/UserManagement';
import Reports           from './pages/admin/Reports';
import SupervisorDashboard       from './pages/supervisor/SupervisorDashboard';
import ScheduleManagement        from './pages/supervisor/ScheduleManagement';
import ComplaintManagement       from './pages/supervisor/ComplaintManagement';
import DriverDashboard     from './pages/driver/DriverDashboard';
import ComplaintForm   from './pages/public/ComplaintForm';
import TrackComplaint  from './pages/public/TrackComplaint';

// Wrap a page with AdminLayout inside a PrivateRoute
function ProtectedPage({ roles, title, children }) {
  return (
    <PrivateRoute allowedRoles={roles}>
      <AdminLayout title={title}>{children}</AdminLayout>
    </PrivateRoute>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login"     element={<Login />} />
          <Route path="/complaint" element={<ComplaintForm />} />
          <Route path="/track"     element={<TrackComplaint />} />
          <Route path="/unauthorized" element={
            <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',flexDirection:'column',gap:12 }}>
              <h2 style={{ color:'var(--danger)' }}>403 — Access Denied</h2>
              <a href="/login" style={{ color:'var(--primary)' }}>Back to Login</a>
            </div>
          } />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<ProtectedPage roles={['ADMIN']} title="Dashboard"><AdminDashboard /></ProtectedPage>} />
          <Route path="/admin/zones"     element={<ProtectedPage roles={['ADMIN']} title="Zone Management"><ZoneManagement /></ProtectedPage>} />
          <Route path="/admin/vehicles"  element={<ProtectedPage roles={['ADMIN']} title="Vehicle Management"><VehicleManagement /></ProtectedPage>} />
          <Route path="/admin/staff"     element={<ProtectedPage roles={['ADMIN']} title="Staff Management"><StaffManagement /></ProtectedPage>} />
          <Route path="/admin/users"     element={<ProtectedPage roles={['ADMIN']} title="User Management"><UserManagement /></ProtectedPage>} />
          <Route path="/admin/reports"   element={<ProtectedPage roles={['ADMIN']} title="Reports & Analytics"><Reports /></ProtectedPage>} />

          {/* Supervisor */}
          <Route path="/supervisor/dashboard"  element={<ProtectedPage roles={['SUPERVISOR','ADMIN']} title="Supervisor Dashboard"><SupervisorDashboard /></ProtectedPage>} />
          <Route path="/supervisor/schedules"  element={<ProtectedPage roles={['SUPERVISOR','ADMIN']} title="Schedule Management"><ScheduleManagement /></ProtectedPage>} />
          <Route path="/supervisor/complaints" element={<ProtectedPage roles={['SUPERVISOR','ADMIN']} title="Complaint Management"><ComplaintManagement /></ProtectedPage>} />

          {/* Driver */}
          <Route path="/driver/dashboard" element={<ProtectedPage roles={['DRIVER']} title="My Tasks"><DriverDashboard /></ProtectedPage>} />

          {/* Default */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
