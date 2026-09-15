const STATUS_STYLES = {
  'In Use': 'bg-blue-100 text-blue-700',
  Available: 'bg-emerald-100 text-emerald-700',
  'In Repair': 'bg-amber-100 text-amber-700',
  Retired: 'bg-slate-200 text-slate-600',
  Disposed: 'bg-slate-200 text-slate-500 line-through',

  Pending: 'bg-amber-100 text-amber-700',
  Approved: 'bg-emerald-100 text-emerald-700',
  Rejected: 'bg-red-100 text-red-700',

  Active: 'bg-emerald-100 text-emerald-700',
  'Expiring Soon': 'bg-amber-100 text-amber-700',
  Expired: 'bg-red-100 text-red-700',

  CREATE: 'bg-emerald-100 text-emerald-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',

  admin: 'bg-purple-100 text-purple-700',
  staff: 'bg-slate-200 text-slate-700',
};

const Badge = ({ value, className = '' }) => {
  const style = STATUS_STYLES[value] || 'bg-slate-100 text-slate-600';
  return <span className={`badge ${style} ${className}`}>{value}</span>;
};

export default Badge;
