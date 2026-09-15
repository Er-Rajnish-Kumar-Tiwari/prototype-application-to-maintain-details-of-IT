import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

const ConfirmDialog = ({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false, loading = false }) => {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex gap-3">
        <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center ${danger ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
          <AlertTriangle className="h-5 w-5" />
        </div>
        <p className="text-sm text-slate-600">{message}</p>
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <button className="btn-secondary" onClick={onClose} disabled={loading}>
          Cancel
        </button>
        <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm} disabled={loading}>
          {loading ? 'Please wait...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
