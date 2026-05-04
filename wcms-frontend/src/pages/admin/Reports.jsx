import { useEffect, useState } from 'react';
import api from '../../api/axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';

const COLORS = ['#00d4a0', '#38bdf8', '#a855f7', '#f59e0b', '#f43f5e', '#10b981'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0d1f35', border: '1px solid rgba(56,130,200,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
      {label && <div style={{ color: '#8ba8c8', marginBottom: 4, fontWeight: 600 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></div>
      ))}
    </div>
  );
};

export default function Reports() {
  const [schedules, setSchedules]   = useState([]);
  const [vehicles, setVehicles]     = useState([]);
  const [staff, setStaff]           = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [zones, setZones]           = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/schedules'),
      api.get('/api/vehicles'),
      api.get('/api/staff'),
      api.get('/api/complaints'),
      api.get('/api/zones'),
    ]).then(([sc, vh, sf, cp, zn]) => {
      setSchedules(sc.data.data  || []);
      setVehicles(vh.data.data   || []);
      setStaff(sf.data.data      || []);
      setComplaints(cp.data.data || []);
      setZones(zn.data.data      || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading" style={{ minHeight: 400 }}>Loading reports…</div>;

  // ── Collection by Zone ──
  const collectionByZone = zones.map(z => ({
    name: z.zoneName,
    Completed: schedules.filter(s => s.zone?.zoneId === z.zoneId && s.status === 'COMPLETED').length,
    Pending:   schedules.filter(s => s.zone?.zoneId === z.zoneId && s.status === 'PENDING').length,
    Missed:    schedules.filter(s => s.zone?.zoneId === z.zoneId && s.status === 'MISSED').length,
  })).filter(z => z.Completed + z.Pending + z.Missed > 0);

  // ── Vehicle Status Distribution ──
  const vehicleStatusData = ['AVAILABLE', 'IN_USE', 'MAINTENANCE'].map(status => ({
    name: status.replace('_', ' '),
    value: vehicles.filter(v => v.status === status).length,
  })).filter(d => d.value > 0);

  // ── Staff Schedules (top performers) ──
  const staffPerf = staff.map(s => {
    const mySchedules = schedules.filter(sc => sc.staff?.staffId === s.staffId);
    return {
      name: s.fullName?.split(' ')[0] || s.staffId,
      Completed: mySchedules.filter(sc => sc.status === 'COMPLETED').length,
      Total:     mySchedules.length,
    };
  }).filter(s => s.Total > 0).sort((a, b) => b.Completed - a.Completed).slice(0, 8);

  // ── Complaint Status Pie ──
  const complaintData = [
    { name: 'Open',        value: complaints.filter(c => c.status === 'OPEN').length        },
    { name: 'In Progress', value: complaints.filter(c => c.status === 'IN_PROGRESS').length },
    { name: 'Resolved',    value: complaints.filter(c => c.status === 'RESOLVED').length    },
  ].filter(d => d.value > 0);

  // ── Complaints by Zone ──
  const complaintByZone = zones.map(z => ({
    name: z.zoneName,
    Complaints: complaints.filter(c => c.zone?.zoneId === z.zoneId).length,
  })).filter(z => z.Complaints > 0).sort((a, b) => b.Complaints - a.Complaints);

  // ── Overall schedule stats ──
  const totalSch = schedules.length;
  const completedPct = totalSch ? Math.round(schedules.filter(s => s.status === 'COMPLETED').length / totalSch * 100) : 0;
  const resolvedPct  = complaints.length ? Math.round(complaints.filter(c => c.status === 'RESOLVED').length / complaints.length * 100) : 0;

  return (
    <div className="management-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">📊 Reports & Analytics</div>
          <div className="page-subtitle">System-wide performance overview</div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="summary-cards" style={{ marginBottom: 32 }}>
        {[
          { icon: '📅', label: 'Total Schedules',    value: totalSch,           cls: 'blue'   },
          { icon: '✅', label: 'Completion Rate',     value: `${completedPct}%`, cls: 'green'  },
          { icon: '📋', label: 'Total Complaints',   value: complaints.length,  cls: 'amber'  },
          { icon: '🔧', label: 'Resolution Rate',    value: `${resolvedPct}%`,  cls: 'purple' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className={`stat-icon-wrap ${s.cls}`}>{s.icon}</div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Row 1: Collection by Zone + Vehicle Status */}
      <div className="report-charts-row">
        <div className="card report-chart-card">
          <div className="report-chart-title">🗑️ Collection Status by Zone</div>
          <div className="report-chart-sub">Schedule completion, pending and missed per zone</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={collectionByZone} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,130,200,0.1)" />
              <XAxis dataKey="name" tick={{ fill: '#8ba8c8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#8ba8c8', fontSize: 12 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#8ba8c8' }} />
              <Bar dataKey="Completed" fill="#00d4a0" radius={[4,4,0,0]} />
              <Bar dataKey="Pending"   fill="#f59e0b" radius={[4,4,0,0]} />
              <Bar dataKey="Missed"    fill="#f43f5e" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          {collectionByZone.length === 0 && <div className="report-empty">No schedule data yet.</div>}
        </div>

        <div className="card report-chart-card">
          <div className="report-chart-title">🚛 Vehicle Fleet Status</div>
          <div className="report-chart-sub">Current distribution of vehicle availability</div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={vehicleStatusData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: '#8ba8c8', strokeWidth: 1 }}
              >
                {vehicleStatusData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {vehicleStatusData.length === 0 && <div className="report-empty">No vehicle data yet.</div>}
        </div>
      </div>

      {/* Row 2: Staff Performance + Complaint Status */}
      <div className="report-charts-row" style={{ marginTop: 20 }}>
        <div className="card report-chart-card">
          <div className="report-chart-title">👷 Staff Performance</div>
          <div className="report-chart-sub">Completed schedules per staff member (top 8)</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={staffPerf} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,130,200,0.1)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#8ba8c8', fontSize: 12 }} allowDecimals={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#8ba8c8', fontSize: 12 }} width={72} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#8ba8c8' }} />
              <Bar dataKey="Completed" fill="#38bdf8" radius={[0,4,4,0]} />
              <Bar dataKey="Total"     fill="rgba(56,189,248,0.2)" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
          {staffPerf.length === 0 && <div className="report-empty">No staff schedule data yet.</div>}
        </div>

        <div className="card report-chart-card">
          <div className="report-chart-title">📋 Complaint Status Overview</div>
          <div className="report-chart-sub">Distribution of complaint resolution statuses</div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={complaintData}
                cx="50%"
                cy="50%"
                outerRadius={110}
                paddingAngle={3}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={{ stroke: '#8ba8c8', strokeWidth: 1 }}
              >
                {complaintData.map((_, i) => (
                  <Cell key={i} fill={[COLORS[4], COLORS[3], COLORS[0]][i % 3]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {complaintData.length === 0 && <div className="report-empty">No complaints yet.</div>}
        </div>
      </div>

      {/* Row 3: Complaints by Zone (full width) */}
      {complaintByZone.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div className="card">
            <div className="report-chart-title">📍 Complaints by Zone</div>
            <div className="report-chart-sub">Which zones generate the most citizen complaints</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={complaintByZone} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,130,200,0.1)" />
                <XAxis dataKey="name" tick={{ fill: '#8ba8c8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#8ba8c8', fontSize: 12 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Complaints" fill="#a855f7" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
