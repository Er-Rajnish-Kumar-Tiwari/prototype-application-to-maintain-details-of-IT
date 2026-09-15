import { Loader2 } from 'lucide-react';

const Loader = ({ label = 'Loading...', full = false }) => {
  return (
    <div className={`flex items-center justify-center gap-2 text-slate-500 ${full ? 'h-64' : 'py-10'}`}>
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
};

export default Loader;
