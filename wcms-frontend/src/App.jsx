import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import ZoneManagement from './pages/admin/ZoneManagement';
import VehicleManagement from './pages/admin/VehicleManagement';
import StaffManagement from './pages/admin/StaffManagement';
import UserManagement from './pages/admin/UserManagement';
import SupervisorDashboard from './pages/supervisor/SupervisorDashboard';
import ScheduleManagement from './pages/supervisor/ScheduleManagement';
import DriverDashboard from './pages/driver/DriverDashboard';
import ComplaintForm from './pages/public/ComplaintForm';
import TrackComplaint from './pages/public/TrackComplaint';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/complaint" element={<ComplaintForm />} />
          <Route path="/track" element={<TrackComplaint />} />
          <Route path="/unauthorized" element={<div style={{ padding: '2rem' }}><h2>403 — Access Denied</h2><a href="/login">Back to Login</a></div>} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<PrivateRoute allowedRoles={['ADMIN']}><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/zones" element={<PrivateRoute allowedRoles={['ADMIN']}><ZoneManagement /></PrivateRoute>} />
          <Route path="/admin/vehicles" element={<PrivateRoute allowedRoles={['ADMIN']}><VehicleManagement /></PrivateRoute>} />
          <Route path="/admin/staff" element={<PrivateRoute allowedRoles={['ADMIN']}><StaffManagement /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute allowedRoles={['ADMIN']}><UserManagement /></PrivateRoute>} />

          {/* Supervisor */}
          <Route path="/supervisor/dashboard" element={<PrivateRoute allowedRoles={['SUPERVISOR', 'ADMIN']}><SupervisorDashboard /></PrivateRoute>} />
          <Route path="/supervisor/schedules" element={<PrivateRoute allowedRoles={['SUPERVISOR', 'ADMIN']}><ScheduleManagement /></PrivateRoute>} />

          {/* Driver */}
          <Route path="/driver/dashboard" element={<PrivateRoute allowedRoles={['DRIVER']}><DriverDashboard /></PrivateRoute>} />

          {/* Default */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
