import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, ArrowRight, MailPlus, Trash2, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [memberEmail, setMemberEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/projects/${id}`)
      .then(res => setProject(res.data.project))
      .catch(() => setError('Project not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const addMember = async e => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!memberEmail.trim()) return setError('Enter a member email.');

    try {
      const res = await api.post(`/projects/${id}/members`, { email: memberEmail });
      setProject(res.data.project);
      setMemberEmail('');
      setMessage('Member added.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member.');
    }
  };

  const removeMember = async memberId => {
    if (!confirm('Remove this member?')) return;
    try {
      const res = await api.delete(`/projects/${id}/members/${memberId}`);
      setProject(res.data.project);
      setMessage('Member removed.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove member.');
    }
  };

  const deleteProject = async () => {
    if (!confirm('Delete this project and all tasks?')) return;
    try {
      await api.delete(`/projects/${id}`);
      navigate('/projects');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete project.');
    }
  };

  if (loading) return <div className="panel p-5 text-sm font-semibold text-slate-600">Loading project...</div>;
  if (!project) return <div className="panel border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error || 'Project not found.'}</div>;

  const isOwner = project.createdBy?._id === user?._id;
  const canManage = user?.role === 'admin' && isOwner;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link to="/projects" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-blue-700">
        <ArrowLeft size={16} />
        Back to projects
      </Link>

      <section className="panel overflow-hidden">
        <div className="border-b border-slate-200 p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
              {project.description && <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{project.description}</p>}
              <p className="mt-2 text-xs text-slate-500">
                Created by {project.createdBy?.name} on {format(new Date(project.createdAt), 'MMM d, yyyy')}
              </p>
            </div>
            <Link to={`/projects/${id}/board`} className="btn-primary">
              Open board
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-500">Members</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{project.members?.length || 0}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-500">Owner</p>
            <p className="mt-2 truncate text-base font-semibold text-slate-900">{project.createdBy?.name || 'Unknown'}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-500">Your access</p>
            <p className="mt-2 text-base font-semibold capitalize text-slate-900">{user?.role}</p>
          </div>
        </div>
      </section>

      {(message || error) && (
        <div className={`panel p-4 text-sm font-semibold ${error ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}`}>
          {error || message}
        </div>
      )}

      <section className="panel p-5">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
              <Users size={20} />
              Team members
            </h2>
            <p className="mt-1 text-sm text-slate-500">People who can view and work on this project.</p>
          </div>
        </div>

        {canManage && (
          <form onSubmit={addMember} className="mb-5 flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:flex-row">
            <input
              type="email"
              value={memberEmail}
              onChange={e => setMemberEmail(e.target.value)}
              className="input-field"
              placeholder="member@example.com"
            />
            <button type="submit" className="btn-primary shrink-0">
              <MailPlus size={17} />
              Add member
            </button>
          </form>
        )}

        <div className="space-y-2">
          {project.members?.map(member => (
            <div key={member._id} className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 transition hover:border-slate-300 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{member.name}</p>
                <p className="truncate text-xs text-slate-500">{member.email}</p>
              </div>
              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <span className="badge badge-todo capitalize">{member.role}</span>
                {canManage && member._id !== user._id && (
                  <button onClick={() => removeMember(member._id)} className="btn-danger min-h-9 px-3 py-2">
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {canManage && (
        <section className="panel border-red-200 bg-red-50/50 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-red-900">Delete project</h2>
              <p className="mt-1 text-sm text-red-700">This removes the project and all related tasks.</p>
            </div>
            <button onClick={deleteProject} className="btn-danger shrink-0">
              <Trash2 size={17} />
              Delete project
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
