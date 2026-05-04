import { useState } from 'react';
import api from '../../api/axios';

const STATUS_CONFIG = {
  OPEN:        { color: '#f43f5e', bg: 'rgba(244,63,94,0.12)',  border: 'rgba(244,63,94,0.3)',  icon: '🔴', label: 'Open' },
  IN_PROGRESS: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', icon: '🟡', label: 'In Progress' },
  RESOLVED:    { color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', icon: '🟢', label: 'Resolved' },
};

const STEPS = [
  { status: 'OPEN',        label: 'Complaint Registered',   icon: '📝' },
  { status: 'IN_PROGRESS', label: 'Under Investigation',    icon: '🔧' },
  { status: 'RESOLVED',    label: 'Issue Resolved',         icon: '✅' },
];

function getStepIndex(status) {
  return ['OPEN', 'IN_PROGRESS', 'RESOLVED'].indexOf(status);
}

export default function TrackComplaint() {
  const [code, setCode] = useState('');
  const [complaint, setComplaint] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    setError('');
    setComplaint(null);
    setLoading(true);
    try {
      const res = await api.get(`/api/complaints/track/${code.trim().toUpperCase()}`);
      setComplaint(res.data.data);
    } catch {
      setError('No complaint found with this tracking code. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const cfg = complaint ? (STATUS_CONFIG[complaint.status] || STATUS_CONFIG.OPEN) : null;
  const stepIdx = complaint ? getStepIndex(complaint.status) : -1;

  return (
    <div className="public-page" style={{ alignItems: 'flex-start', paddingTop: '60px' }}>
      <div className="track-page-wrap">
        {/* Header */}
        <div className="track-header">
          <a href="/" className="track-brand">♻️ WCMS</a>
          <h1>Track Your Complaint</h1>
          <p>Enter your tracking code to see the current status of your complaint</p>
        </div>

        {/* Search */}
        <div className="track-search-card">
          <form onSubmit={handleTrack} className="track-search-form">
            <div className="track-input-wrap">
              <span className="track-search-icon">🔍</span>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="e.g. WCMS-2025-00042"
                required
                className="track-input"
                id="input-tracking-code"
                style={{ paddingLeft: '42px' }}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              id="btn-track-complaint"
            >
              {loading ? 'Searching...' : 'Track →'}
            </button>
          </form>
          {error && <div className="alert alert-error" style={{ marginTop: '14px', marginBottom: 0 }}>{error}</div>}
        </div>

        {/* Result */}
        {complaint && (
          <div className="track-result-card" style={{ borderColor: cfg.border }}>
            {/* Status Badge */}
            <div className="track-status-row">
              <div className="track-status-badge" style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}>
                {cfg.icon} {cfg.label}
              </div>
              <span className="track-code-tag">{complaint.trackingCode}</span>
            </div>

            {/* Timeline */}
            <div className="track-timeline">
              {STEPS.map((step, i) => {
                const done    = i <= stepIdx;
                const current = i === stepIdx;
                return (
                  <div key={step.status} className={`timeline-step ${done ? 'done' : ''} ${current ? 'current' : ''}`}>
                    <div className="timeline-icon">{done ? step.icon : '○'}</div>
                    <div className="timeline-label">{step.label}</div>
                    {i < STEPS.length - 1 && <div className={`timeline-line ${done && i < stepIdx ? 'done' : ''}`} />}
                  </div>
                );
              })}
            </div>

            {/* Details */}
            <div className="track-details-grid">
              <div className="track-detail-item">
                <span className="td-label">Zone</span>
                <span className="td-value">📍 {complaint.zone?.zoneName || '—'}</span>
              </div>
              <div className="track-detail-item">
                <span className="td-label">Status</span>
                <span className="td-value" style={{ color: cfg.color }}>{cfg.label}</span>
              </div>
              <div className="track-detail-item" style={{ gridColumn: '1 / -1' }}>
                <span className="td-label">Issue Description</span>
                <span className="td-value">{complaint.description}</span>
              </div>
              {complaint.resolution && (
                <div className="track-detail-item" style={{ gridColumn: '1 / -1' }}>
                  <span className="td-label">Resolution Notes</span>
                  <span className="td-value" style={{ color: '#10b981' }}>✅ {complaint.resolution}</span>
                </div>
              )}
            </div>

            <div className="track-footer-actions">
              <button className="btn btn-secondary btn-sm" onClick={() => { setComplaint(null); setCode(''); }} id="btn-track-new">
                ← Search Another
              </button>
              <a href="/complaint" className="btn btn-ghost btn-sm" id="link-new-complaint">
                + Submit New Complaint
              </a>
            </div>
          </div>
        )}

        {/* Help text when no result yet */}
        {!complaint && !error && (
          <div className="track-help">
            <p>💡 Your tracking code was provided when you submitted your complaint. It looks like <code>WCMS-2025-00001</code></p>
            <a href="/complaint" id="link-submit-complaint">Don't have a code? Submit a new complaint →</a>
          </div>
        )}
      </div>
    </div>
  );
}
