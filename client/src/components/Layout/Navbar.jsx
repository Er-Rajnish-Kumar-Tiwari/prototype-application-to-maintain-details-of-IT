import { Menu, LogOut, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../Notifications/NotificationBell';
import Badge from '../UI/Badge';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
      <button className="lg:hidden text-slate-600" onClick={onMenuClick}>
        <Menu className="h-6 w-6" />
      </button>
      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        <NotificationBell />
        <div className="relative" ref={ref}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 pl-2 pr-1 py-1.5 rounded-lg hover:bg-slate-100"
          >
            <div className="h-8 w-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-slate-700 leading-tight">{user?.name}</p>
              <Badge value={user?.role} className="mt-0.5" />
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 card py-1 z-40">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-sm font-medium text-slate-700 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
