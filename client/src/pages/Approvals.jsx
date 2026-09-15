import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ClipboardCheck } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ApprovalCard from '../components/Approvals/ApprovalCard';
import Loader from '../components/UI/Loader';

const TABS = ['Pending', 'Approved', 'Rejected', 'All'];

const Approvals = () => {
  const { isAdmin } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Pending');

  const load = async () => {
    setLoading(true);
    try {
      const params = tab !== 'All' ? { status: tab } : {};
      const res = await api.get('/approvals', { params });
      setRequests(res.data.requests);
    } catch (err) {
      toast.error('Failed to load approval requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const handleApprove = async (id) => {
    try {
      await api.put(`/approvals/${id}/approve`);
      toast.success('Request approved');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (id, comment) => {
    try {
      await api.put(`/approvals/${id}/reject`, { comment });
      toast.success('Request rejected');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Approval Requests</h1>
        <p className="text-slate-500 text-sm">
          {isAdmin
            ? 'Review and approve/reject asset add, edit and delete requests raised by departments.'
            : 'Track the status of asset requests you have submitted.'}
        </p>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader full />
      ) : requests.length === 0 ? (
        <div className="card p-12 flex flex-col items-center text-center text-slate-400">
          <ClipboardCheck className="h-10 w-10 mb-3" />
          <p className="font-medium text-slate-600">No {tab.toLowerCase()} requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <ApprovalCard key={r._id} request={r} isAdmin={isAdmin} onApprove={handleApprove} onReject={handleReject} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Approvals;
