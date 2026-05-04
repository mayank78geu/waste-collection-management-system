// TrackComplaint.jsx — Public page (Increment 3)
import { useState } from 'react';
import api from '../../api/axios';

export default function TrackComplaint() {
  const [code, setCode] = useState('');
  const [complaint, setComplaint] = useState(null);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    setError('');
    setComplaint(null);
    try {
      const res = await api.get(`/api/complaints/track/${code}`);
      setComplaint(res.data.data);
    } catch (err) {
      setError('No complaint found with this tracking code.');
    }
  };

  const statusColor = { OPEN: '#e74c3c', IN_PROGRESS: '#f39c12', RESOLVED: '#27ae60' };

  return (
    <div className="public-page">
      <div className="form-card">
        <h2>🔍 Track Your Complaint</h2>
        <form onSubmit={handleTrack}>
          <div className="form-group">
            <label>Tracking Code</label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="e.g. WCMS-2024-00042"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full">Track</button>
        </form>

        {error && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{error}</div>}

        {complaint && (
          <div className="complaint-result">
            <div className="complaint-status" style={{ color: statusColor[complaint.status] }}>
              ● {complaint.status}
            </div>
            <p><strong>Zone:</strong> {complaint.zone?.zoneName}</p>
            <p><strong>Description:</strong> {complaint.description}</p>
            {complaint.resolution && <p><strong>Resolution:</strong> {complaint.resolution}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
