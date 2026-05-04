import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function ComplaintForm() {
  const [zones, setZones] = useState([]);
  const [zoneId, setZoneId] = useState('');
  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [trackingCode, setTrackingCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get('/api/zones').then(res => setZones(res.data.data || [])).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/api/complaints', {
        zoneId: parseInt(zoneId),
        description,
      });
      setTrackingCode(res.data.data.trackingCode);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(trackingCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (trackingCode) {
    return (
      <div className="public-page">
        <div className="complaint-success-card">
          <div className="success-icon-wrap">✅</div>
          <h2>Complaint Submitted!</h2>
          <p className="success-sub">Your complaint has been registered successfully. Use the tracking code below to monitor its status.</p>
          <div className="tracking-code-block">
            <span className="tracking-label">Tracking Code</span>
            <code className="tracking-code">{trackingCode}</code>
            <button className="btn btn-secondary btn-sm" onClick={copyCode} id="btn-copy-code">
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>
          <div className="success-actions">
            <a href="/track" className="btn btn-primary" id="btn-go-track">🔍 Track My Complaint</a>
            <button className="btn btn-secondary" onClick={() => { setTrackingCode(''); setDescription(''); setZoneId(''); setName(''); setPhone(''); }} id="btn-new-complaint">
              + New Complaint
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="public-page">
      <div className="complaint-page-wrap">
        {/* Left branding panel */}
        <div className="complaint-info-panel">
          <div className="complaint-brand">
            <span style={{ fontSize: 48 }}>♻️</span>
            <h1>WCMS</h1>
            <p>Waste Collection Management System</p>
          </div>
          <div className="complaint-features">
            <div className="cf-feature">
              <span className="cf-icon">📍</span>
              <div>
                <div className="cf-title">Zone-Based Reporting</div>
                <div className="cf-desc">Report issues in your specific zone for faster resolution.</div>
              </div>
            </div>
            <div className="cf-feature">
              <span className="cf-icon">🔍</span>
              <div>
                <div className="cf-title">Real-Time Tracking</div>
                <div className="cf-desc">Track your complaint status using your unique code.</div>
              </div>
            </div>
            <div className="cf-feature">
              <span className="cf-icon">⚡</span>
              <div>
                <div className="cf-title">Swift Resolution</div>
                <div className="cf-desc">Our supervisors are notified immediately for quick action.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right form */}
        <div className="complaint-form-card">
          <div className="complaint-form-header">
            <h2>🗑️ Report a Waste Issue</h2>
            <p>Fill in the details below to submit your complaint</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="complaint-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cf-name">Your Name (optional)</label>
                <input
                  id="cf-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Ravi Kumar"
                />
              </div>
              <div className="form-group">
                <label htmlFor="cf-phone">Phone (optional)</label>
                <input
                  id="cf-phone"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="cf-zone">Select Zone *</label>
              <select id="cf-zone" value={zoneId} onChange={e => setZoneId(e.target.value)} required>
                <option value="">— Choose your zone —</option>
                {zones.map(z => (
                  <option key={z.zoneId} value={z.zoneId}>
                    {z.zoneName} {z.description ? `– ${z.description}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="cf-desc">Describe the Issue *</label>
              <textarea
                id="cf-desc"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={5}
                required
                placeholder="e.g. Garbage not collected for 3 days near Block B. Bins are overflowing..."
                minLength={20}
              />
              <span className="char-count">{description.length} / 500</span>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
              id="btn-submit-complaint"
            >
              {loading ? 'Submitting...' : '📤 Submit Complaint'}
            </button>
          </form>

          <div className="complaint-form-footer">
            Already submitted?{' '}
            <a href="/track" id="link-track">Track your complaint →</a>
          </div>
        </div>
      </div>
    </div>
  );
}
