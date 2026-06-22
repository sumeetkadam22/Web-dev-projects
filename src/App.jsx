import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
  ReferenceLine,
} from 'recharts';
import {
  Activity,
  AlertTriangle,
  BarChart2,
  Bell,
  Brain,
  ChevronRight,
  CircleUser,
  Clock,
  Download,
  Gauge,
  Heart,
  Info,
  LayoutDashboard,
  Loader2,
  Moon,
  Mic,
  Send,
  Settings,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Wind,
  Zap,
} from 'lucide-react';

// ── Constants ──────────────────────────────────────────────────────────────────

const API_BASE = 'http://localhost:8000';

const QUICK_PRESETS = [
  'Severe migraine at 2pm after skipping breakfast',
  'Headache at work, severity 7',
  'Neck stiffness, moderate pain after poor sleep',
  'Intense migraine with nausea, severity 9',
  'Mild headache, pressure 4 out of 10',
];

const INSIGHT_ICONS = {
  'alert-triangle': AlertTriangle,
  'moon': Moon,
  'wind': Wind,
};

const INSIGHT_COLORS = {
  high: { icon: '#ef4444', label: 'text-red-600', badge: 'bg-red-50 text-red-700' },
  medium: { icon: '#f59e0b', label: 'text-amber-600', badge: 'bg-amber-50 text-amber-700' },
  low: { icon: '#0d9488', label: 'text-teal-600', badge: 'bg-teal-50 text-teal-700' },
};

// ── Utility Helpers ────────────────────────────────────────────────────────────

function formatPressure(p) {
  return `${Number(p ?? 0).toFixed(0)} hPa`;
}

function formatSleep(s) {
  return `${Number(s ?? 0).toFixed(1)}h`;
}

// ── Custom Recharts Tooltip ────────────────────────────────────────────────────

const CustomChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-xs min-w-[140px]">
      <p className="font-semibold text-slate-700 mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-4 mt-1">
          <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: entry.color }} />
            {entry.name}
          </span>
          <span className="font-bold text-slate-800">
            {entry.name === 'Pressure' ? `${entry.value} hPa` : `${entry.value}/10`}
          </span>
        </div>
      ))}
    </div>
  );
};

// ── Toast ──────────────────────────────────────────────────────────────────────

const Toast = ({ message, type, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className={`toast ${type}`} role="alert" aria-live="polite">
      {type === 'success' ? '✓ ' : '✗ '}{message}
    </div>
  );
};

// ── Sidebar ────────────────────────────────────────────────────────────────────

const Sidebar = ({ activeNav, setActiveNav }) => {
  const navItems = [
    { id: 'logging', label: 'Pain Logging', icon: Activity },
    { id: 'telemetry', label: 'Telemetry', icon: Zap },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'insights', label: 'Insights', icon: Brain },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="flex flex-col h-full" style={{ width: 200 }}>
      {/* Profile */}
      <div className="px-4 pt-6 pb-4">
        <p className="text-xs font-semibold tracking-widest uppercase text-slate-400 mb-3">
          Clinician Profile
        </p>
        <div className="flex flex-col gap-0.5">
          <span className="text-base font-bold text-teal-600">Dr. Richardson</span>
          <span className="text-xs text-slate-500">Neurology Dept.</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 px-3 flex-1">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            id={`nav-${id}`}
            className={`nav-item ${activeNav === id ? 'active' : ''}`}
            onClick={() => setActiveNav(id)}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>

      {/* Export Button */}
      <div className="p-4 mt-auto">
        <button
          id="btn-export"
          className="w-full btn-teal text-sm py-3"
          onClick={() => alert('Export functionality would generate a clinical PDF report.')}
        >
          <Download size={15} />
          Export Clinical Data
        </button>
      </div>
    </aside>
  );
};

// ── Header ─────────────────────────────────────────────────────────────────────

const Header = () => (
  <header
    className="flex items-center justify-between px-6 py-3 border-b"
    style={{
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(12px)',
      borderColor: 'rgba(203,213,225,0.5)',
      boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
    }}
  >
    {/* Logo */}
    <div className="flex items-center gap-2">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)' }}
      >
        <Activity size={16} color="white" />
      </div>
      <h1 className="text-lg font-bold text-slate-800 tracking-tight">
        TrackMyPain{' '}
        <span className="font-light text-slate-400">//</span>{' '}
        <span className="text-teal-600">Clinical Analytics</span>
      </h1>
    </div>

    {/* Nav links */}
    <nav className="hidden md:flex items-center gap-1">
      {['Dashboard', 'Analytics', 'Patient History', 'Reports'].map((item, i) => (
        <button
          key={item}
          id={`header-nav-${item.toLowerCase().replace(/\s+/g, '-')}`}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            i === 0
              ? 'text-teal-600 border-b-2 border-teal-500'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
          }`}
        >
          {item}
        </button>
      ))}
    </nav>

    {/* Actions */}
    <div className="flex items-center gap-3">
      <div className="relative">
        <button
          id="btn-notifications"
          className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <Bell size={18} />
        </button>
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
          3
        </span>
      </div>
      <button
        id="btn-profile"
        className="w-9 h-9 rounded-full flex items-center justify-center bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors"
      >
        <CircleUser size={20} />
      </button>
    </div>
  </header>
);

// ── Natural Log Input Panel ────────────────────────────────────────────────────

const LogInputPanel = ({ onLogSubmitted }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef(null);

  const handlePreset = (preset) => {
    setText(preset);
    textareaRef.current?.focus();
  };

  const handleSubmit = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/logs/voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setText('');
      onLogSubmitted(data, null);
    } catch (err) {
      onLogSubmitted(null, err.message ?? 'Failed to submit log');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Natural Log Input</h2>
          <p className="text-xs text-slate-400 mt-0.5">Describe symptoms in plain language</p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
          <Mic size={15} />
        </div>
      </div>

      {/* Textarea */}
      <textarea
        id="log-textarea"
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Describe the patient's pain experience today..."
        rows={5}
        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400 transition-all"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.ctrlKey) handleSubmit();
        }}
      />

      {/* Preset chips */}
      <div className="flex flex-wrap gap-2">
        {QUICK_PRESETS.map((preset) => (
          <button
            key={preset}
            className="preset-chip"
            onClick={() => handlePreset(preset)}
          >
            {preset.length > 28 ? preset.slice(0, 26) + '…' : preset}
          </button>
        ))}
      </div>

      {/* Submit */}
      <button
        id="btn-submit-log"
        className="btn-teal w-full py-3"
        disabled={!text.trim() || loading}
        onClick={handleSubmit}
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Send size={16} />
        )}
        {loading ? 'Submitting…' : 'Submit Natural Log'}
      </button>

      <p className="text-center text-xs text-slate-400">
        Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono text-xs">Ctrl+Enter</kbd> to submit
      </p>
    </div>
  );
};

// ── Patient Adherence Widget ───────────────────────────────────────────────────

const AdherenceWidget = () => (
  <div className="glass-card p-5">
    <p className="text-xs font-semibold tracking-widest uppercase text-slate-400 mb-3">
      Patient Adherence
    </p>
    <div className="flex items-baseline gap-2 mb-1">
      <span className="text-4xl font-extrabold text-slate-800">94%</span>
      <span className="text-sm font-semibold text-emerald-500 flex items-center gap-0.5">
        <TrendingUp size={13} />
        3.2%
      </span>
    </div>
    <p className="text-sm text-slate-500 mb-4">
      Logging frequency is high. Patient consistently records evening triggers.
    </p>
    <div className="progress-bar-track">
      <div className="progress-bar-fill" style={{ width: '94%' }} />
    </div>
    <div className="flex justify-between mt-1.5 text-xs text-slate-400">
      <span>0%</span>
      <span>Target: 90%</span>
      <span>100%</span>
    </div>
  </div>
);

// ── Stat Widgets Row ───────────────────────────────────────────────────────────

const StatWidgets = ({ dashboard, loading }) => {
  const stats = [
    {
      id: 'stat-sleep',
      icon: Moon,
      label: 'SLEEP',
      value: loading ? '—' : formatSleep(dashboard?.sleep_hours),
      color: '#6366f1',
      bg: '#eef2ff',
      sub: 'hrs last night',
    },
    {
      id: 'stat-hrv',
      icon: Heart,
      label: 'HRV',
      value: loading ? '—' : `${dashboard?.hrv_ms ?? '—'}ms`,
      color: '#0d9488',
      bg: '#f0fdfa',
      sub: 'heart rate var.',
    },
    {
      id: 'stat-pressure',
      icon: Gauge,
      label: 'PRESSURE',
      value: loading ? '—' : formatPressure(dashboard?.pressure_hpa),
      color: '#f59e0b',
      bg: '#fffbeb',
      sub: 'barometric',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map(({ id, icon: Icon, label, value, color, bg, sub }) => (
        <div key={id} id={id} className="stat-widget">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mb-1"
            style={{ background: bg }}
          >
            <Icon size={20} color={color} />
          </div>
          <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color }}>
            {label}
          </p>
          {loading ? (
            <div className="skeleton w-16 h-7 mt-1" />
          ) : (
            <p className="text-2xl font-extrabold text-slate-800">{value}</p>
          )}
          <p className="text-[11px] text-slate-400">{sub}</p>
        </div>
      ))}
    </div>
  );
};

// ── Dual-Axis Chart ────────────────────────────────────────────────────────────

const PainPressureChart = ({ chartData, loading }) => {
  // Normalise pressure for visual overlay: map [1000..1020] → [0..10]
  const normalised = chartData.map((d) => ({
    ...d,
    pressureNorm: Math.max(0, Math.min(10, ((d.pressure - 1000) / 20) * 10)),
  }));

  return (
    <div className="glass-card p-5 flex flex-col gap-4 flex-1">
      {/* Card header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-800">7-Day Pain &amp; Pressure Correlation</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualizing environmental impact on neuro-sensitivity
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-teal-500 inline-block" />
            Pain
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-0.5 bg-slate-400 inline-block" style={{ borderTop: '2px dashed #94a3b8' }} />
            Pressure
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1" style={{ minHeight: 220 }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={28} className="animate-spin text-teal-400" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
            <BarChart2 size={32} />
            <p className="text-sm">No chart data yet. Submit a log to populate the graph.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={normalised} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'Inter' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="pain"
                domain={[0, 10]}
                tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'Inter' }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip content={<CustomChartTooltip />} />
              <ReferenceLine yAxisId="pain" y={6} stroke="#ef4444" strokeDasharray="4 3" strokeWidth={1} opacity={0.5} />
              <Bar
                yAxisId="pain"
                dataKey="pain"
                name="Pain"
                fill="#0d9488"
                radius={[6, 6, 0, 0]}
                maxBarSize={44}
                opacity={0.9}
              />
              <Line
                yAxisId="pain"
                type="monotone"
                dataKey="pressureNorm"
                name="Pressure"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="5 3"
                dot={false}
                activeDot={{ r: 4, fill: '#64748b' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

// ── Analytic Summary Card ──────────────────────────────────────────────────────

const AnalyticSummaryCard = ({ summary, loading }) => (
  <div
    className="rounded-xl p-4 flex items-start gap-4"
    style={{ background: 'rgba(240,253,250,0.85)', border: '1px solid rgba(13,148,136,0.15)' }}
  >
    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: '#0d9488' }}>
      <Sparkles size={18} color="white" />
    </div>
    <div>
      <p className="text-xs font-bold tracking-widest uppercase text-teal-700 mb-1">Analytic Summary</p>
      {loading ? (
        <div className="skeleton w-64 h-4" />
      ) : (
        <p className="text-sm text-slate-700 leading-relaxed">{summary}</p>
      )}
    </div>
  </div>
);

// ── Clinical Insights Panel ────────────────────────────────────────────────────

const ClinicalInsightsPanel = ({ correlations, loading }) => {
  const insights = correlations?.insights ?? [];

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-800">Clinical Insights</h2>
        <button
          id="btn-insights-info"
          className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
        >
          <Info size={15} />
        </button>
      </div>

      {/* Insight cards */}
      <div className="flex flex-col gap-3">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-4">
              <div className="skeleton w-32 h-4 mb-2" />
              <div className="skeleton w-full h-3 mb-1" />
              <div className="skeleton w-3/4 h-3" />
            </div>
          ))
        ) : insights.length === 0 ? (
          <div className="glass-card p-6 text-center text-slate-400">
            <Brain size={28} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No insights yet. Seed the database first.</p>
          </div>
        ) : (
          insights.map((insight, i) => {
            const IconComponent = INSIGHT_ICONS[insight.icon] ?? AlertTriangle;
            const colors = INSIGHT_COLORS[insight.severity] ?? INSIGHT_COLORS.low;
            return (
              <div key={i} id={`insight-card-${i}`} className={`insight-card ${insight.severity} glass-card`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <IconComponent size={15} color={colors.icon} />
                  <span className={`text-sm font-semibold ${colors.label}`}>{insight.title}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{insight.description}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <div className="progress-bar-track flex-1">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${insight.confidence_pct}%`,
                        background:
                          insight.severity === 'high'
                            ? 'linear-gradient(90deg,#ef4444,#dc2626)'
                            : insight.severity === 'medium'
                            ? 'linear-gradient(90deg,#f59e0b,#d97706)'
                            : 'linear-gradient(90deg,#0d9488,#14b8a6)',
                      }}
                    />
                  </div>
                  <span className={`text-[11px] font-bold ${colors.label}`}>{insight.confidence_pct}%</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Real-time Telemetry footer */}
      <div className="glass-card p-4 mt-auto">
        <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-3">
          Real-Time Telemetry
        </p>
        <div className="flex flex-col gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-600 font-medium">System Latency</span>
              <span className="text-xs font-bold text-teal-600">12ms</span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: '8%' }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-600 font-medium">Sensor Stability</span>
              <span className="text-xs font-bold text-teal-600">99.8%</span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: '99.8%' }} />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <div className="pulse-dot" />
            <span className="text-xs text-slate-500">All sensors nominal</span>
          </div>
        </div>
      </div>

      {/* Neural AI Prediction button */}
      <button
        id="btn-neural-predict"
        className="btn-teal w-full py-3 text-sm"
        onClick={() => alert('Neural AI prediction engine would generate a 48-hour pain forecast.')}
      >
        <Brain size={16} />
        Neural AI Prediction
      </button>
    </div>
  );
};

// ── Recent Logs Table ──────────────────────────────────────────────────────────

const RecentLogsTable = ({ logs, loading }) => {
  const severityColor = (s) => {
    if (s >= 8) return 'text-red-600 bg-red-50';
    if (s >= 5) return 'text-amber-600 bg-amber-50';
    return 'text-teal-600 bg-teal-50';
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-700">Recent Symptom Logs</h3>
        <span className="text-xs text-slate-400">{logs.length} entries</span>
      </div>
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-10 w-full rounded-lg" />)}
        </div>
      ) : logs.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-4">No logs found. Submit a pain log above.</p>
      ) : (
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {logs.slice(0, 10).map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${severityColor(log.severity)}`}>
                  {log.severity}/10
                </span>
                <span className="text-sm text-slate-700 font-medium truncate">{log.symptom}</span>
              </div>
              <span className="text-xs text-slate-400 flex-shrink-0 flex items-center gap-1">
                <Clock size={11} />
                {new Date(log.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Root App ───────────────────────────────────────────────────────────────────

export default function App() {
  const [activeNav, setActiveNav] = useState('trends');

  // Data state
  const [dashboard, setDashboard] = useState(null);
  const [correlations, setCorrelations] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);

  // Loading state
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [correlationsLoading, setCorrelationsLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);

  // Toast state
  const [toast, setToast] = useState(null);

  // ── Data fetchers ─────────────────────────────────────────────────────────

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/analytics/dashboard`);
      if (!res.ok) throw new Error('Dashboard fetch failed');
      const data = await res.json();
      setDashboard(data);
    } catch {
      // dashboard keeps showing skeletons if backend is down
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  const fetchCorrelations = useCallback(async () => {
    setCorrelationsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/analytics/correlations`);
      if (!res.ok) throw new Error('Correlations fetch failed');
      const data = await res.json();
      setCorrelations(data);
    } catch {
      // silently fail
    } finally {
      setCorrelationsLoading(false);
    }
  }, []);

  const fetchChartData = useCallback(async () => {
    setChartLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/logs/chart`);
      if (!res.ok) throw new Error('Chart data fetch failed');
      const data = await res.json();
      setChartData(data);
    } catch {
      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  }, []);

  const fetchRecentLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/logs/symptoms?limit=10`);
      if (!res.ok) throw new Error('Logs fetch failed');
      const data = await res.json();
      setRecentLogs(data);
    } catch {
      setRecentLogs([]);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchDashboard(), fetchCorrelations(), fetchChartData(), fetchRecentLogs()]);
  }, [fetchDashboard, fetchCorrelations, fetchChartData, fetchRecentLogs]);

  // ── Seed on mount, then fetch all data ───────────────────────────────────

  useEffect(() => {
    const init = async () => {
      try {
        await fetch(`${API_BASE}/api/v1/seed`, { method: 'POST' });
      } catch {
        // If seed fails (backend offline), still try to fetch existing data
      }
      await refreshAll();
    };
    init();
  }, [refreshAll]);

  // ── Log submission handler ───────────────────────────────────────────────

  const handleLogSubmitted = useCallback(async (data, error) => {
    if (error) {
      setToast({ message: `Error: ${error}`, type: 'error' });
    } else {
      setToast({ message: `Logged: ${data?.symptom} (severity ${data?.severity}/10)`, type: 'success' });
      await refreshAll();
    }
  }, [refreshAll]);

  // ── Layout ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#f0f4f8' }}>
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className="flex-shrink-0 flex flex-col border-r overflow-y-auto"
          style={{
            width: 200,
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(12px)',
            borderColor: 'rgba(203,213,225,0.4)',
          }}
        >
          <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-5">
          <div className="flex gap-5 h-full min-h-0">

            {/* ── Left Column ──────────────────────────────────────────── */}
            <div className="flex flex-col gap-4" style={{ width: 280, flexShrink: 0 }}>
              <LogInputPanel onLogSubmitted={handleLogSubmitted} />
              <AdherenceWidget />
              <RecentLogsTable logs={recentLogs} loading={logsLoading} />
            </div>

            {/* ── Center Column ────────────────────────────────────────── */}
            <div className="flex flex-col gap-4 flex-1 min-w-0">
              <StatWidgets dashboard={dashboard} loading={dashboardLoading} />
              <PainPressureChart chartData={chartData} loading={chartLoading} />
              <AnalyticSummaryCard
                summary={correlations?.summary}
                loading={correlationsLoading}
              />
            </div>

            {/* ── Right Column ─────────────────────────────────────────── */}
            <div style={{ width: 260, flexShrink: 0 }}>
              <ClinicalInsightsPanel
                correlations={correlations}
                loading={correlationsLoading}
              />
            </div>

          </div>
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
