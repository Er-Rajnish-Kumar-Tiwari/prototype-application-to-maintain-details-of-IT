import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, FileDown, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AssetFilters from '../components/Assets/AssetFilters';
import AssetTable from '../components/Assets/AssetTable';
import AssetForm from '../components/Assets/AssetForm';
import Modal from '../components/UI/Modal';
import ConfirmDialog from '../components/UI/ConfirmDialog';

const Assets = () => {
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [assets, setAssets] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [filterOptions, setFilterOptions] = useState({});

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    department: searchParams.get('department') || '',
    status: searchParams.get('status') || '',
    type: searchParams.get('type') || '',
    location: searchParams.get('location') || '',
    warrantyStatus: searchParams.get('warrantyStatus') || '',
    page: 1,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDepartmentsAndFilters = useCallback(async () => {
    const [deptRes, filterRes] = await Promise.all([
      api.get('/departments'),
      api.get('/assets/meta/filters'),
    ]);
    setDepartments(deptRes.data.departments);
    setFilterOptions(filterRes.data);
  }, []);

  const fetchAssets = useCallback(async (f) => {
    setLoading(true);
    try {
      const params = { ...f };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const res = await api.get('/assets', { params });
      setAssets(res.data.assets);
      setMeta({ total: res.data.total, page: res.data.page, pages: res.data.pages });
    } catch (err) {
      toast.error('Failed to load assets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartmentsAndFilters();
  }, [fetchDepartmentsAndFilters]);

  useEffect(() => {
    fetchAssets(filters);
    const params = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v && k !== 'page') params[k] = v;
    });
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = (next) => setFilters({ ...next, page: 1 });
  const handleReset = () =>
    setFilters({ search: '', department: '', status: '', type: '', location: '', warrantyStatus: '', page: 1 });

  const openAddForm = () => {
    setEditingAsset(null);
    setFormOpen(true);
  };
  const openEditForm = (asset) => {
    setEditingAsset(asset);
    setFormOpen(true);
  };

  const handleSubmit = async (data) => {
    setSaving(true);
    try {
      if (editingAsset) {
        const res = await api.put(`/assets/${editingAsset._id}`, data);
        toast.success(res.data.applied ? 'Asset updated' : 'Edit submitted for approval');
      } else {
        const res = await api.post('/assets', data);
        toast.success(res.data.applied ? 'Asset created' : 'New asset submitted for approval');
      }
      setFormOpen(false);
      fetchAssets(filters);
      fetchDepartmentsAndFilters();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save asset');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await api.delete(`/assets/${deleteTarget._id}`);
      toast.success(res.data.applied ? 'Asset deleted' : 'Delete request submitted for approval');
      setDeleteTarget(null);
      fetchAssets(filters);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete asset');
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = async (type) => {
    try {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => {
        if (v && k !== 'page') params[k] = v;
      });
      const res = await api.get(`/export/${type}`, { params, responseType: 'blob' });
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `it-assets.${type === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Export downloaded');
    } catch (err) {
      toast.error('Export failed');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Assets</h1>
          <p className="text-slate-500 text-sm">Manage all IT assets across departments</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary" onClick={() => handleExport('csv')}>
            <FileDown className="h-4 w-4" /> CSV
          </button>
          <button className="btn-secondary" onClick={() => handleExport('excel')}>
            <FileSpreadsheet className="h-4 w-4" /> Excel
          </button>
          <button className="btn-primary" onClick={openAddForm}>
            <Plus className="h-4 w-4" /> Add Asset
          </button>
        </div>
      </div>

      <AssetFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleReset}
        departments={departments}
        filterOptions={filterOptions}
      />

      <AssetTable
        assets={assets}
        loading={loading}
        page={meta.page}
        pages={meta.pages}
        total={meta.total}
        onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
        onEdit={openEditForm}
        onDelete={setDeleteTarget}
      />

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editingAsset ? 'Edit Asset' : 'Add New Asset'}>
        <AssetForm
          initialData={editingAsset}
          departments={departments}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
          loading={saving}
          isAdmin={isAdmin}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Asset"
        message={
          isAdmin
            ? `Are you sure you want to permanently delete "${deleteTarget?.equipmentName}"? This cannot be undone.`
            : `This will send a delete request for "${deleteTarget?.equipmentName}" to the Head of Organization for approval.`
        }
        confirmLabel={isAdmin ? 'Delete' : 'Submit Request'}
        danger={isAdmin}
        loading={deleting}
      />
    </div>
  );
};

export default Assets;
