import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const adminNav = [
  { to: '/admin/dashboard', icon: '⬛', label: 'Dashboard' },
  { to: '/admin/zones',     icon: '📍', label: 'Zones' },
  { to: '/admin/vehicles',  icon: '🚛', label: 'Vehicles' },
  { to: '/admin/staff',     icon: '👷', label: 'Staff' },
  { to: '/admin/users',     icon: '👥', label: 'Users' },
];
const supervisorNav = [
  { to: '/supervisor/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/supervisor/schedules', icon: '📅', label: 'Schedules' },
];
const driverNav = [
  { to: '/driver/dashboard', icon: '🗺️', label: 'My Tasks' },
];

export default function AdminLayout({ children, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems =
    user?.role === 'ADMIN' ? adminNav :
    user?.role === 'SUPERVISOR' ? supervisorNav :
    driverNav;

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name
    ?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">♻️</span>
          <div>
            <div className="logo-text">WCMS</div>
            <div className="logo-sub">Waste Collection</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Navigation</div>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          <div className="nav-section-label" style={{ marginTop: 16 }}>Public</div>
          <a className="nav-item" href="/complaint" target="_blank" rel="noreferrer">
            <span className="nav-icon">📋</span>Submit Complaint
          </a>
          <a className="nav-item" href="/track" target="_blank" rel="noreferrer">
            <span className="nav-icon">🔍</span>Track Complaint
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info-mini">
            <div className="user-avatar">{initials}</div>
            <div>
              <div className="user-name-mini">{user?.name}</div>
              <div className="user-role-mini">{user?.role}</div>
            </div>
          </div>
          <button className="nav-item btn-ghost" onClick={handleLogout} id="btn-logout">
            <span className="nav-icon">🚪</span>Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="main-content">
        <header className="topbar">
          <span className="topbar-title">{title}</span>
          <div className="topbar-actions">
            <span style={{ fontSize: 13, color: 'var(--text-2)' }}>
              Welcome back, <strong style={{ color: 'var(--text-1)' }}>{user?.name}</strong>
            </span>
          </div>
        </header>
        <main className="content-area">{children}</main>
      </div>
    </div>
  );
}
