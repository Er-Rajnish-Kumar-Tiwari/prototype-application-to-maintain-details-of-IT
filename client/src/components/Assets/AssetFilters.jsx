import { Search, X, SlidersHorizontal } from 'lucide-react';

const AssetFilters = ({ filters, onChange, onReset, departments, filterOptions }) => {
  const update = (key, value) => onChange({ ...filters, [key]: value });

  const hasActiveFilters = Object.entries(filters).some(
    ([k, v]) => k !== 'page' && v
  );

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
        <SlidersHorizontal className="h-4 w-4" /> Search &amp; Filters
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search by asset no, name, serial, user..."
            value={filters.search || ''}
            onChange={(e) => update('search', e.target.value)}
          />
        </div>

        <select className="input" value={filters.department || ''} onChange={(e) => update('department', e.target.value)}>
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>

        <select className="input" value={filters.status || ''} onChange={(e) => update('status', e.target.value)}>
          <option value="">All Status</option>
          {(filterOptions.statuses || []).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select className="input" value={filters.type || ''} onChange={(e) => update('type', e.target.value)}>
          <option value="">All Types</option>
          {(filterOptions.types || []).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select className="input" value={filters.location || ''} onChange={(e) => update('location', e.target.value)}>
          <option value="">All Locations</option>
          {(filterOptions.locations || []).map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between">
        <select
          className="input w-auto text-sm"
          value={filters.warrantyStatus || ''}
          onChange={(e) => update('warrantyStatus', e.target.value)}
        >
          <option value="">All Warranty Status</option>
          <option value="Active">Warranty Active</option>
          <option value="Expiring Soon">Expiring Soon (30 days)</option>
          <option value="Expired">Expired</option>
        </select>

        {hasActiveFilters && (
          <button onClick={onReset} className="btn-ghost text-sm">
            <X className="h-4 w-4" /> Clear filters
          </button>
        )}
      </div>
    </div>
  );
};

export default AssetFilters;
