import { useEffect, useState } from 'react';
import api from '../../api/axios';

const ROLES = ['ADMIN', 'SUPERVISOR', 'DRIVER', 'CITIZEN'];

function UserModal({ user, onClose, onSaved }) {
  const isEdit = !!user;
  const [form, setForm] = useState({
    name:     user?.name  || '',
    email:    user?.email || '',
    password: '',
    role:     user?.role  || 'DRIVER',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/api/users/${user.userId}`, { name: form.name, role: form.role });
      } else {
        if (!form.password) { setError('Password is required'); setLoading(false); return; }
        await api.post('/api/users', form);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user');
    } finally { setLoading(false); }
  };

  const roleBadge = (r) => <span className={`badge badge-role-${r.toLowerCase()}`}>{r}</span>;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{isEdit ? 'Edit User' : 'Create User'}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label>Full Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Ravi Sharma" required />
          </div>
          {!isEdit && (
            <>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="ravi@wcms.com" required />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min 6 characters" required />
              </div>
            </>
          )}
          <div className="form-group">
            <label>Role *</label>
            <select value={form.role} onChange={e => set('role', e.target.value)}>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UserManagement() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);
  const [search,  setSearch]  = useState('');

  const fetch = () => {
    setLoading(true);
    api.get('/api/users').then(r => setUsers(r.data.data || [])).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(fetch, []);

  const handleDelete = async (u) => {
    if (!confirm(`Delete user "${u.name}"? This cannot be undone.`)) return;
    try { await api.delete(`/api/users/${u.userId}`); fetch(); }
    catch (e) { alert(e.response?.data?.message || 'Delete failed'); }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="management-page">
      <div className="page-header">
        <div>
          <div className="page-title">User Management</div>
          <div className="page-subtitle">{users.length} user{users.length !== 1 ? 's' : ''} in system</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            style={{ width: 220 }}
            placeholder="🔍 Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="btn btn-primary" id="btn-add-user" onClick={() => setModal('add')}>+ Create User</button>
        </div>
      </div>

      {loading ? <div className="loading" /> : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.userId}>
                  <td style={{ color: 'var(--text-3)', fontFamily: 'monospace' }}>{u.userId}</td>
                  <td><strong>{u.name}</strong></td>
                  <td style={{ color: 'var(--text-2)' }}>{u.email}</td>
                  <td><span className={`badge badge-role-${u.role?.toLowerCase()}`}>{u.role}</span></td>
                  <td>
                    <div className="actions">
                      <button className="btn btn-sm btn-secondary" id={`btn-edit-user-${u.userId}`} onClick={() => setModal(u)}>Edit</button>
                      <button className="btn btn-sm btn-danger" id={`btn-delete-user-${u.userId}`} onClick={() => handleDelete(u)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr className="empty-row"><td colSpan={5}>{search ? 'No users match your search.' : 'No users yet.'}</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <UserModal
          user={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetch(); }}
        />
      )}
    </div>
  );
}
