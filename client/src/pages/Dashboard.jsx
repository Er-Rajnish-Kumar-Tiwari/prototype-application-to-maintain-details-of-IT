import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Boxes,
  ShieldAlert,
  ShieldX,
  ClipboardCheck,
  ArrowUpRight,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import api from '../api/axios';
import StatCard from '../components/UI/StatCard';
import Badge from '../components/UI/Badge';
import Loader from '../components/UI/Loader';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
  'In Use': '#3b82f6',
  Available: '#10b981',
  'In Repair': '#f59e0b',
  Retired: '#94a3b8',
  Disposed: '#cbd5e1',
};

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-');

const Dashboard = () => {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, alertsRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/warranty-alerts'),
        ]);
        setStats(statsRes.data);
        setAlerts(alertsRes.data.assets);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || !stats) return <Loader full label="Loading dashboard..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm">Organization-wide snapshot of IT assets</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Boxes} label="Total Assets" value={stats.totalAssets} tone="brand" />
        <StatCard
          icon={ShieldAlert}
          label="Warranty Expiring Soon"
          value={stats.warranty.expiringSoon}
          tone="amber"
          sub="Within next 30 days"
        />
        <StatCard icon={ShieldX} label="Warranty Expired" value={stats.warranty.expired} tone="red" />
        <StatCard
          icon={ClipboardCheck}
          label="Pending Approvals"
          value={stats.pendingApprovals}
          tone="slate"
          sub={isAdmin ? 'Awaiting your review' : 'Across the organization'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="font-semibold text-slate-700 mb-4">Assets by Status</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={stats.statusBreakdown}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
              >
                {stats.statusBreakdown.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#64748b'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-slate-700 mb-4">Assets by Department</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.departmentBreakdown} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="department" width={110} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-700">Warranty Alerts</h2>
            <Link to="/assets?warrantyStatus=Expiring Soon" className="text-xs text-brand-600 flex items-center gap-1 hover:underline">
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {alerts.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No assets with expiring warranty 🎉</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {alerts.map((a) => (
                <Link
                  key={a._id}
                  to={`/assets/${a._id}`}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 border border-slate-100"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-700">{a.equipmentName}</p>
                    <p className="text-xs text-slate-400">
                      {a.assetNumber} &middot; {a.department?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge value={a.warrantyStatus} />
                    <p className="text-xs text-slate-400 mt-1">{fmtDate(a.warrantyExpiryDate)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-700">Recently Added Assets</h2>
            <Link to="/assets" className="text-xs text-brand-600 flex items-center gap-1 hover:underline">
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {stats.recentAssets.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No assets added yet</p>
          ) : (
            <div className="space-y-2">
              {stats.recentAssets.map((a) => (
                <Link
                  key={a._id}
                  to={`/assets/${a._id}`}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 border border-slate-100"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-700">{a.equipmentName}</p>
                    <p className="text-xs text-slate-400">
                      {a.assetNumber} &middot; {a.department?.name}
                    </p>
                  </div>
                  <Badge value={a.status} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
