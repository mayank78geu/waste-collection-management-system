// ComplaintForm.jsx — Stub (Increment 3)
import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function ComplaintForm() {
  const [zones, setZones] = useState([]);
  const [zoneId, setZoneId] = useState('');
  const [description, setDescription] = useState('');
  const [trackingCode, setTrackingCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/zones').then(res => setZones(res.data.data || [])).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/api/complaints', { zoneId: parseInt(zoneId), description });
      setTrackingCode(res.data.data.trackingCode);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    }
  };

  if (trackingCode) {
    return (
      <div className="public-page">
        <div className="success-card">
          <h2>✅ Complaint Submitted</h2>
          <p>Your tracking code is:</p>
          <code className="tracking-code">{trackingCode}</code>
          <p>Use this code to track your complaint status.</p>
          <a href="/track" className="btn btn-primary">Track Complaint</a>
        </div>
      </div>
    );
  }

  return (
    <div className="public-page">
      <div className="form-card">
        <h2>🗑️ Report a Waste Issue</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Zone</label>
            <select value={zoneId} onChange={e => setZoneId(e.target.value)} required>
              <option value="">Select a zone...</option>
              {zones.map(z => <option key={z.zoneId} value={z.zoneId}>{z.zoneName}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} required />
          </div>
          <button type="submit" className="btn btn-primary btn-full">Submit Complaint</button>
        </form>
      </div>
    </div>
  );
}
