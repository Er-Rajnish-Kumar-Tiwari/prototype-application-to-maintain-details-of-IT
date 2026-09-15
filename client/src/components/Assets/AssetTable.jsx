import { Eye, Pencil, Trash2, ChevronLeft, ChevronRight, PackageOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Badge from '../UI/Badge';
import Loader from '../UI/Loader';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-');

const AssetTable = ({ assets, loading, page, pages, total, onPageChange, onEdit, onDelete }) => {
  const navigate = useNavigate();

  if (loading) return <Loader full label="Loading assets..." />;

  if (!assets.length) {
    return (
      <div className="card p-12 flex flex-col items-center text-center text-slate-400">
        <PackageOpen className="h-10 w-10 mb-3" />
        <p className="font-medium text-slate-600">No assets found</p>
        <p className="text-sm">Try adjusting your search or filters, or add a new asset.</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Asset No.</th>
              <th className="text-left px-4 py-3 font-medium">Equipment</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Department</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Location</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Assigned To</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium hidden xl:table-cell">Warranty</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {assets.map((asset) => (
              <tr key={asset._id} className="hover:bg-slate-50 cursor-pointer" onClick={() => navigate(`/assets/${asset._id}`)}>
                <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">{asset.assetNumber}</td>
                <td className="px-4 py-3">
                  <p className="text-slate-700 font-medium">{asset.equipmentName}</p>
                  <p className="text-xs text-slate-400">{asset.makeModel}</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-slate-600">{asset.department?.name || '-'}</td>
                <td className="px-4 py-3 hidden lg:table-cell text-slate-600">{asset.location}</td>
                <td className="px-4 py-3 hidden lg:table-cell text-slate-600">{asset.assignedUser || '-'}</td>
                <td className="px-4 py-3">
                  <Badge value={asset.status} />
                </td>
                <td className="px-4 py-3 hidden xl:table-cell">
                  <Badge value={asset.warrantyStatus} />
                  <p className="text-xs text-slate-400 mt-1">{fmtDate(asset.warrantyExpiryDate)}</p>
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      title="View details"
                      onClick={() => navigate(`/assets/${asset._id}`)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      title="Edit"
                      onClick={() => onEdit(asset)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-blue-500"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      title="Delete"
                      onClick={() => onDelete(asset)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-sm">
          <p className="text-slate-500">
            Page {page} of {pages} &middot; {total} total assets
          </p>
          <div className="flex gap-2">
            <button
              className="btn-secondary py-1.5 px-3"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              className="btn-secondary py-1.5 px-3"
              disabled={page >= pages}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetTable;
