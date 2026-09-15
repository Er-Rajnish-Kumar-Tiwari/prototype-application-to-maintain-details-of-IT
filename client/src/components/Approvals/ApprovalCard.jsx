import { useState } from 'react';
import { Check, X, Clock, User2 } from 'lucide-react';
import Badge from '../UI/Badge';

const fmtDate = (d) => (d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '-');

const FIELD_LABELS = {
  assetNumber: 'Asset Number',
  equipmentName: 'Equipment Name',
  type: 'Type',
  makeModel: 'Make / Model',
  serialNumber: 'Serial Number',
  location: 'Location',
  assignedUser: 'Assigned User',
  vendor: 'Vendor',
  purchaseDate: 'Purchase Date',
  purchaseCost: 'Purchase Cost',
  warrantyExpiryDate: 'Warranty Expiry',
  status: 'Status',
  notes: 'Notes',
};

const ChangesPreview = ({ request }) => {
  if (request.requestType === 'CREATE') {
    const data = request.proposedChanges || {};
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-600 mt-2">
        {Object.entries(FIELD_LABELS).map(([key, label]) =>
          data[key] ? (
            <div key={key}>
              <span className="text-slate-400">{label}: </span>
              <span className="font-medium">{String(data[key])}</span>
            </div>
          ) : null
        )}
      </div>
    );
  }

  if (request.requestType === 'UPDATE') {
    const before = request.assetSnapshot || {};
    const after = request.proposedChanges || {};
    const changedKeys = Object.keys(after).filter((k) => String(before[k] ?? '') !== String(after[k] ?? ''));

    if (!changedKeys.length) return <p className="text-xs text-slate-400 mt-2">No field-level changes recorded.</p>;

    return (
      <div className="space-y-1.5 mt-2">
        {changedKeys.map((key) => (
          <div key={key} className="text-xs flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 w-28 shrink-0">{FIELD_LABELS[key] || key}:</span>
            <span className="line-through text-red-400">{String(before[key] ?? '-')}</span>
            <span className="text-slate-300">→</span>
            <span className="text-emerald-600 font-medium">{String(after[key] ?? '-')}</span>
          </div>
        ))}
      </div>
    );
  }

  // DELETE
  const asset = request.assetSnapshot || {};
  return (
    <p className="text-xs text-slate-500 mt-2">
      Requesting permanent deletion of <span className="font-medium">{asset.equipmentName}</span> (
      {asset.assetNumber}).
    </p>
  );
};

const ApprovalCard = ({ request, isAdmin, onApprove, onReject }) => {
  const [comment, setComment] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [busy, setBusy] = useState(false);

  const assetLabel =
    request.assetSnapshot?.equipmentName ||
    request.proposedChanges?.equipmentName ||
    request.asset?.equipmentName ||
    'Asset';
  const assetNo =
    request.assetSnapshot?.assetNumber || request.proposedChanges?.assetNumber || request.asset?.assetNumber || '';

  const runApprove = async () => {
    setBusy(true);
    await onApprove(request._id);
    setBusy(false);
  };

  const runReject = async () => {
    setBusy(true);
    await onReject(request._id, comment);
    setBusy(false);
    setShowReject(false);
  };

  return (
    <div className="card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge value={request.requestType} />
            <Badge value={request.status} />
            <span className="font-medium text-slate-700">{assetLabel}</span>
            {assetNo && <span className="text-xs text-slate-400">({assetNo})</span>}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5">
            <span className="flex items-center gap-1">
              <User2 className="h-3.5 w-3.5" /> {request.requestedBy?.name || 'Unknown'}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {fmtDate(request.createdAt)}
            </span>
          </div>
        </div>

        {isAdmin && request.status === 'Pending' && (
          <div className="flex items-center gap-2">
            <button className="btn-primary py-1.5 px-3" onClick={runApprove} disabled={busy}>
              <Check className="h-4 w-4" /> Approve
            </button>
            <button className="btn-danger py-1.5 px-3" onClick={() => setShowReject((s) => !s)} disabled={busy}>
              <X className="h-4 w-4" /> Reject
            </button>
          </div>
        )}
      </div>

      <ChangesPreview request={request} />

      {request.status !== 'Pending' && request.reviewComment && (
        <p className="text-xs text-slate-500 mt-2 bg-slate-50 rounded-lg p-2">
          <span className="font-medium">Reviewer comment:</span> {request.reviewComment}
        </p>
      )}
      {request.status !== 'Pending' && request.reviewedBy && (
        <p className="text-xs text-slate-400 mt-1">
          Reviewed by {request.reviewedBy.name} on {fmtDate(request.reviewedAt)}
        </p>
      )}

      {showReject && (
        <div className="mt-3 flex gap-2">
          <input
            className="input"
            placeholder="Reason for rejection (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button className="btn-danger" onClick={runReject} disabled={busy}>
            Confirm
          </button>
        </div>
      )}
    </div>
  );
};

export default ApprovalCard;
