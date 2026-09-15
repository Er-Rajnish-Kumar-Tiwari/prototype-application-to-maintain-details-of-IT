import { useState } from 'react';
import { Info } from 'lucide-react';

const ASSET_TYPES = [
  'Laptop',
  'Desktop',
  'Monitor',
  'Printer',
  'Server',
  'Networking Device',
  'Mobile Phone',
  'Tablet',
  'UPS',
  'Projector',
  'Scanner',
  'Other',
];

const STATUSES = ['Available', 'In Use', 'In Repair', 'Retired', 'Disposed'];

const toDateInput = (d) => (d ? new Date(d).toISOString().split('T')[0] : '');

const emptyForm = {
  assetNumber: '',
  equipmentName: '',
  type: 'Laptop',
  makeModel: '',
  serialNumber: '',
  location: '',
  department: '',
  assignedUser: '',
  vendor: '',
  purchaseDate: '',
  purchaseCost: '',
  warrantyExpiryDate: '',
  status: 'Available',
  notes: '',
};

const AssetForm = ({ initialData, departments, onSubmit, onCancel, loading, isAdmin }) => {
  const [form, setForm] = useState(
    initialData
      ? {
          ...emptyForm,
          ...initialData,
          department: initialData.department?._id || initialData.department || '',
          purchaseDate: toDateInput(initialData.purchaseDate),
          warrantyExpiryDate: toDateInput(initialData.warrantyExpiryDate),
        }
      : emptyForm
  );
  const [errors, setErrors] = useState({});

  const update = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const req = ['assetNumber', 'equipmentName', 'makeModel', 'serialNumber', 'location', 'department', 'purchaseDate', 'warrantyExpiryDate'];
    const newErrors = {};
    req.forEach((f) => {
      if (!form[f]) newErrors[f] = 'Required';
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ ...form, purchaseCost: form.purchaseCost ? Number(form.purchaseCost) : 0 });
  };

  const field = (key, label, type = 'text', extraProps = {}) => (
    <div>
      <label className="label">
        {label} {['assetNumber', 'equipmentName', 'makeModel', 'serialNumber', 'location', 'purchaseDate', 'warrantyExpiryDate'].includes(key) && (
          <span className="text-red-500">*</span>
        )}
      </label>
      <input
        type={type}
        className={`input ${errors[key] ? 'border-red-400' : ''}`}
        value={form[key]}
        onChange={(e) => update(key, e.target.value)}
        {...extraProps}
      />
      {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isAdmin && (
        <div className="flex items-start gap-2 bg-amber-50 text-amber-700 text-sm rounded-lg p-3">
          <Info className="h-4 w-4 mt-0.5 shrink-0" />
          <p>This change will be sent to the Head of Organization for approval before it takes effect.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {field('assetNumber', 'Asset Number', 'text', { placeholder: 'e.g. AST-0006' })}
        {field('equipmentName', 'Equipment Name', 'text', { placeholder: 'e.g. Dell Latitude Laptop' })}

        <div>
          <label className="label">Type</label>
          <select className="input" value={form.type} onChange={(e) => update('type', e.target.value)}>
            {ASSET_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {field('makeModel', 'Make / Model')}
        {field('serialNumber', 'Serial Number')}
        {field('location', 'Location', 'text', { placeholder: 'e.g. Head Office - 3rd Floor' })}

        <div>
          <label className="label">
            Department <span className="text-red-500">*</span>
          </label>
          <select
            className={`input ${errors.department ? 'border-red-400' : ''}`}
            value={form.department}
            onChange={(e) => update('department', e.target.value)}
          >
            <option value="">Select department</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
          {errors.department && <p className="text-xs text-red-500 mt-1">Required</p>}
        </div>

        {field('assignedUser', 'Assigned User', 'text', { placeholder: 'Employee name (optional)' })}
        {field('vendor', 'Vendor / Supplier')}
        {field('purchaseDate', 'Purchase Date', 'date')}
        {field('purchaseCost', 'Purchase Cost (₹)', 'number', { min: 0, step: '0.01' })}
        {field('warrantyExpiryDate', 'Warranty Expiry Date', 'date')}

        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={(e) => update('status', e.target.value)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea
          className="input"
          rows={3}
          placeholder="Any additional remarks..."
          value={form.notes}
          onChange={(e) => update('notes', e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : isAdmin ? 'Save Asset' : 'Submit for Approval'}
        </button>
      </div>
    </form>
  );
};

export default AssetForm;
