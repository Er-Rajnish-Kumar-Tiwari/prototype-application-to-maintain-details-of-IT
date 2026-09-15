import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  ClipboardCheck,
  Building2,
  Users,
  X,
  MonitorSmartphone,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/assets', label: 'Assets', icon: Boxes },
  { to: '/approvals', label: 'Approvals', icon: ClipboardCheck },
  { to: '/departments', label: 'Departments', icon: Building2 },
  { to: '/users', label: 'Users', icon: Users, adminOnly: true },
];

const Sidebar = ({ open, onClose }) => {
  const { user } = useAuth();

  return (
    <>
      {open && <div className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed z-40 inset-y-0 left-0 w-64 bg-slate-900 text-slate-200 flex flex-col transform transition-transform lg:translate-x-0 lg:static lg:z-auto ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <MonitorSmartphone className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-white">IT Asset Manager</span>
          </div>
          <button className="lg:hidden text-slate-400" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.filter((item) => !item.adminOnly || user?.role === 'admin').map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <item.icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-slate-800 text-xs text-slate-500">
          IT Asset Management Prototype v1.0
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
