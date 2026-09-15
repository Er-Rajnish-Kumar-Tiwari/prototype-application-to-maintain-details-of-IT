import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/UI/Modal';
import ConfirmDialog from '../components/UI/ConfirmDialog';
import Loader from '../components/UI/Loader';

const emptyForm = { name: '', code: '', description: '' };

const Departments = () => {
  const { isAdmin } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/departments');
      setDepartments(res.data.departments);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };
  const openEdit = (dept) => {
    setEditing(dept);
    setForm({ name: dept.name, code: dept.code || '', description: dept.description || '' });
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/departments/${editing._id}`, form);
        toast.success('Department updated');
      } else {
        await api.post('/departments', form);
        toast.success('Department created');
      }
      setFormOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save department');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/departments/${deleteTarget._id}`);
      toast.success('Department deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete department');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Departments</h1>
          <p className="text-slate-500 text-sm">Organization departments used to group assets and users</p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={openAdd}>
            <Plus className="h-4 w-4" /> Add Department
          </button>
        )}
      </div>

      {loading ? (
        <Loader full />
      ) : departments.length === 0 ? (
        <div className="card p-12 flex flex-col items-center text-center text-slate-400">
          <Building2 className="h-10 w-10 mb-3" />
          <p className="font-medium text-slate-600">No departments yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((d) => (
            <div key={d._id} className="card p-4">
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-semibold">
                  {d.code || d.name.charAt(0)}
                </div>
                {isAdmin && (
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(d)} className="p-1.5 rounded-lg hover:bg-slate-100 text-blue-500">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(d)} className="p-1.5 rounded-lg hover:bg-slate-100 text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              <p className="font-medium text-slate-700 mt-3">{d.name}</p>
              {d.description && <p className="text-sm text-slate-400 mt-1">{d.description}</p>}
            </div>
          ))}
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Edit Department' : 'Add Department'} maxWidth="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Department Name</label>
            <input
              required
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Code</label>
            <input className="input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input"
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setFormOpen(false)} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Department"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Departments with assets assigned cannot be deleted.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
      />
    </div>
  );
};

export default Departments;
