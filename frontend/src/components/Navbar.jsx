import { Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const initialsFor = name =>
  name
    ?.split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'TM';

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white px-4 py-3 sm:px-6 lg:px-8">
      <div className="page-wrap flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onMenuClick}
            className="btn-secondary h-10 w-10 p-0 lg:hidden"
            aria-label="Open navigation"
          >
            <Menu size={18} />
          </button>

          <div>
            <p className="text-sm font-semibold text-slate-900">Team Task Manager</p>
            <p className="text-xs text-slate-500">Workspace overview</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-2.5 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-700">
              {initialsFor(user?.name)}
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-semibold text-slate-900">{user?.name}</p>
              <p className="truncate text-xs capitalize text-slate-500">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
