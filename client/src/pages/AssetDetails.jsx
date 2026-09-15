import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/UI/Badge';
import Loader from '../components/UI/Loader';
import Modal from '../components/UI/Modal';
import ConfirmDialog from '../components/UI/ConfirmDialog';
import AssetForm from '../components/Assets/AssetForm';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-');
const fmtMoney = (n) => (n ? `₹${Number(n).toLocaleString('en-IN')}` : '-');

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between py-2.5 border-b border-slate-50 last:border-0">
    <span className="text-sm text-slate-500">{label}</span>
    <span className="text-sm font-medium text-slate-700 text-right">{value || '-'}</span>
  </div>
);

const AssetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [asset, setAsset] = useState(null);
  const [pendingRequest, setPendingRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [assetRes, deptRes] = await Promise.all([api.get(`/assets/${id}`), api.get('/departments')]);
      setAsset(assetRes.data.asset);
      setPendingRequest(assetRes.data.pendingRequest);
      setDepartments(deptRes.data.departments);
    } catch (err) {
      toast.error('Asset not found');
      navigate('/assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (data) => {
    setSaving(true);
    try {
      const res = await api.put(`/assets/${id}`, data);
      toast.success(res.data.applied ? 'Asset updated' : 'Edit submitted for approval');
      setFormOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update asset');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await api.delete(`/assets/${id}`);
      toast.success(res.data.applied ? 'Asset deleted' : 'Delete request submitted for approval');
      if (res.data.applied) {
        navigate('/assets');
      } else {
        setConfirmDelete(false);
        load();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete asset');
    } finally {
      setDeleting(false);
    }
  };

  if (loading || !asset) return <Loader full label="Loading asset..." />;

  return (
    <div className="space-y-5 max-w-4xl">
      <button onClick={() => navigate('/assets')} className="btn-ghost -ml-2">
        <ArrowLeft className="h-4 w-4" /> Back to Assets
      </button>

      {pendingRequest && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-lg p-3 flex items-center gap-2">
          <Clock className="h-4 w-4 shrink-0" />
          This asset has a pending <b className="mx-1">{pendingRequest.requestType}</b> request awaiting Head of
          Organization approval.
          <Link to="/approvals" className="underline ml-1">
            View
          </Link>
        </div>
      )}

      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-semibold text-slate-800">{asset.equipmentName}</h1>
              <Badge value={asset.status} />
            </div>
            <p className="text-slate-400 text-sm mt-1">
              {asset.assetNumber} &middot; {asset.makeModel}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-secondary" onClick={() => setFormOpen(true)} disabled={!!pendingRequest}>
              <Pencil className="h-4 w-4" /> Edit
            </button>
            <button className="btn-danger" onClick={() => setConfirmDelete(true)} disabled={!!pendingRequest}>
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 mt-6">
          <div>
            <DetailRow label="Asset Number" value={asset.assetNumber} />
            <DetailRow label="Equipment Name" value={asset.equipmentName} />
            <DetailRow label="Type" value={asset.type} />
            <DetailRow label="Make / Model" value={asset.makeModel} />
            <DetailRow label="Serial Number" value={asset.serialNumber} />
            <DetailRow label="Location" value={asset.location} />
            <DetailRow label="Department" value={asset.department?.name} />
          </div>
          <div>
            <DetailRow label="Assigned User" value={asset.assignedUser} />
            <DetailRow label="Vendor" value={asset.vendor} />
            <DetailRow label="Purchase Date" value={fmtDate(asset.purchaseDate)} />
            <DetailRow label="Purchase Cost" value={fmtMoney(asset.purchaseCost)} />
            <DetailRow
              label="Warranty Expiry"
              value={
                <span className="flex items-center gap-2 justify-end">
                  {fmtDate(asset.warrantyExpiryDate)} <Badge value={asset.warrantyStatus} />
                </span>
              }
            />
            <DetailRow label="Created By" value={asset.createdBy?.name} />
            <DetailRow label="Last Updated" value={fmtDate(asset.updatedAt)} />
          </div>
        </div>

        {asset.notes && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-500 mb-1">Notes</p>
            <p className="text-sm text-slate-700">{asset.notes}</p>
          </div>
        )}
      </div>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Edit Asset">
        <AssetForm
          initialData={asset}
          departments={departments}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
          loading={saving}
          isAdmin={isAdmin}
        />
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete Asset"
        message={
          isAdmin
            ? `Are you sure you want to permanently delete "${asset.equipmentName}"? This cannot be undone.`
            : `This will send a delete request for "${asset.equipmentName}" to the Head of Organization for approval.`
        }
        confirmLabel={isAdmin ? 'Delete' : 'Submit Request'}
        danger={isAdmin}
        loading={deleting}
      />
    </div>
  );
};

export default AssetDetails;
