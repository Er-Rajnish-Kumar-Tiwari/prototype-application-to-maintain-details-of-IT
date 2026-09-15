import { Link } from 'react-router-dom';
import { MonitorSmartphone } from 'lucide-react';

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
    <MonitorSmartphone className="h-12 w-12 text-slate-300 mb-4" />
    <h1 className="text-3xl font-semibold text-slate-800">404</h1>
    <p className="text-slate-500 mt-1 mb-6">The page you're looking for doesn't exist.</p>
    <Link to="/dashboard" className="btn-primary">
      Go to Dashboard
    </Link>
  </div>
);

export default NotFound;
