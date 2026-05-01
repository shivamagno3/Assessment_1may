import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowRight, FolderPlus, Search, Users, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

function CreateProjectModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Project name is required.');

    setLoading(true);
    try {
      const res = await api.post('/projects', form);
      onCreate(res.data.project);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4" onClick={onClose}>
      <div className="modal-enter w-full max-w-lg rounded-lg border border-slate-200 bg-white p-5" onClick={e => e.stopPropagation()}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Create project</h2>
            <p className="mt-1 text-sm text-slate-500">Set up a workspace for team tasks.</p>
          </div>
          <button onClick={onClose} className="btn-ghost h-9 w-9 p-0" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Project name</label>
            <input
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              className="input-field"
              placeholder="Website refresh"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              className="input-field min-h-28"
              placeholder="What is this team trying to ship?"
            />
          </div>
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              <FolderPlus size={17} />
              {loading ? 'Creating...' : 'Create project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    api.get('/projects')
      .then(res => setProjects(res.data.projects))
      .catch(() => setError('Failed to load projects.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredProjects = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return projects;
    return projects.filter(project =>
      project.name?.toLowerCase().includes(needle) ||
      project.description?.toLowerCase().includes(needle)
    );
  }, [projects, query]);

  if (loading) return <div className="panel p-5 text-sm font-semibold text-slate-600">Loading projects...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="mt-2 text-sm text-slate-500">{projects.length} projects available to you</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-slate-500 sm:w-72">
            <Search size={17} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="min-w-0 flex-1 border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="Search projects"
            />
          </label>
          {user?.role === 'admin' && (
            <button onClick={() => setShowCreate(true)} className="btn-primary">
              <FolderPlus size={17} />
              New project
            </button>
          )}
        </div>
      </div>

      {error && <div className="panel border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}

      {filteredProjects.length === 0 ? (
        <div className="panel flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <FolderPlus size={24} />
          </div>
          <p className="text-lg font-semibold text-slate-900">{query ? 'No matching projects' : 'No projects yet'}</p>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            {user?.role === 'admin'
              ? 'Create a project to start organizing members and tasks.'
              : 'Ask an admin to add you to a project when work is ready.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map(project => {
            const memberCount = project.members?.length || 0;
            const memberLabel = `${memberCount} ${memberCount === 1 ? 'member' : 'members'}`;

            return (
              <article key={project._id} className="panel flex min-h-60 flex-col p-5 transition duration-200 hover:border-slate-300">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-semibold text-slate-900">{project.name}</h2>
                    <p className="mt-2 text-xs font-semibold uppercase text-slate-400">
                      {format(new Date(project.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-600">
                    <Users size={14} />
                    {memberLabel}
                  </div>
                </div>

                <p className="mt-4 line-clamp-2 min-h-12 text-sm leading-6 text-slate-600">
                  {project.description || 'No description added yet.'}
                </p>

                <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
                  <Link to={`/projects/${project._id}`} className="btn-secondary">
                    Members
                  </Link>
                  <Link to={`/projects/${project._id}/board`} className="btn-primary">
                    Board
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {showCreate && (
        <CreateProjectModal onClose={() => setShowCreate(false)} onCreate={project => setProjects(prev => [project, ...prev])} />
      )}
    </div>
  );
}
