import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      // silent fail - notifications are non-critical
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    fetchNotifications();
  };

  const markOneRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    fetchNotifications();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 card z-40 max-h-96 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <p className="font-semibold text-sm text-slate-700">Notifications</p>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-brand-600 hover:underline flex items-center gap-1">
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>
          <div className="overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No notifications yet</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n._id}
                  onClick={() => !n.isRead && markOneRead(n._id)}
                  className={`w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 ${
                    !n.isRead ? 'bg-brand-50/50' : ''
                  }`}
                >
                  <p className="text-sm text-slate-700 leading-snug">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
                </button>
              ))
            )}
          </div>
          <Link
            to="/approvals"
            onClick={() => setOpen(false)}
            className="text-center text-xs text-brand-600 py-2 border-t border-slate-100 hover:bg-slate-50"
          >
            View approval requests
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
