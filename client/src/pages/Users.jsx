import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Users as UsersIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/UI/Modal';
import ConfirmDialog from '../components/UI/ConfirmDialog';
import Loader from '../components/UI/Loader';
import Badge from '../components/UI/Badge';

const emptyForm = { name: '', email: '', password: '', role: 'staff', department: '', designation: '', isActive: true };

const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
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
      const [usersRes, deptRes] = await Promise.all([api.get('/users'), api.get('/departments')]);
      setUsers(usersRes.data.users);
      setDepartments(deptRes.data.departments);
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
  const openEdit = (u) => {
    setEditing(u);
    setForm({
      name: u.name,
      email: u.email,
      password: '',
      role: u.role,
      department: u.department?._id || '',
      designation: u.designation || '',
      isActive: u.isActive,
    });
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await api.put(`/users/${editing._id}`, payload);
        toast.success('User updated');
      } else {
        await api.post('/users', form);
        toast.success('User created');
      }
      setFormOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/users/${deleteTarget._id}`);
      toast.success('User deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Users</h1>
          <p className="text-slate-500 text-sm">Manage user accounts and department access (Head of Organization only)</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add User
        </button>
      </div>

      {loading ? (
        <Loader full />
      ) : users.length === 0 ? (
        <div className="card p-12 flex flex-col items-center text-center text-slate-400">
          <UsersIcon className="h-10 w-10 mb-3" />
          <p className="font-medium text-slate-600">No users yet</p>
        </div>
      ) : (
        <div className="card overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Role</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Department</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Status</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-700">{u.name}</td>
                  <td className="px-4 py-3 text-slate-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <Badge value={u.role} />
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-slate-600">{u.department?.name || '-'}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`badge ${u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg hover:bg-slate-100 text-blue-500">
                        <Pencil className="h-4 w-4" />
                      </button>
                      {u._id !== currentUser?._id && (
                        <button onClick={() => setDeleteTarget(u)} className="p-1.5 rounded-lg hover:bg-slate-100 text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Edit User' : 'Add User'} maxWidth="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              required
              type="email"
              disabled={!!editing}
              className="input disabled:bg-slate-100"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="label">{editing ? 'New Password (leave blank to keep unchanged)' : 'Password'}</label>
            <input
              required={!editing}
              type="password"
              minLength={6}
              className="input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Role</label>
              <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="staff">Department Staff</option>
                <option value="admin">Head of Organization</option>
              </select>
            </div>
            <div>
              <label className="label">Department</label>
              <select
                className="input"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              >
                <option value="">None</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Designation</label>
            <input
              className="input"
              value={form.designation}
              onChange={(e) => setForm({ ...form, designation: e.target.value })}
            />
          </div>
          {editing && (
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              Account active
            </label>
          )}
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
        title="Delete User"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete"
        danger
        loading={deleting}
      />
    </div>
  );
};

export default Users;
