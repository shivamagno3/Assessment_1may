import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { format, isPast } from 'date-fns';
import { CalendarClock, Circle, ListFilter, Plus, Trash2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const STATUSES = ['Todo', 'In Progress', 'Done'];

const priorityClass = priority => ({
  High: 'badge-high',
  Medium: 'badge-medium',
  Low: 'badge-low',
}[priority] || 'badge-low');

const statusMeta = {
  Todo: { dot: 'bg-slate-400', header: 'bg-slate-50' },
  'In Progress': { dot: 'bg-blue-500', header: 'bg-blue-50' },
  Done: { dot: 'bg-green-500', header: 'bg-green-50' },
};

function CreateTaskModal({ project, onClose, onCreate }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    deadline: '',
    priority: 'Medium',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) return setError('Task title is required.');
    if (!form.assignedTo) return setError('Choose a member to assign this task.');

    setLoading(true);
    try {
      const res = await api.post('/tasks', {
        ...form,
        projectId: project._id,
        deadline: form.deadline || undefined,
      });
      onCreate(res.data.task);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4" onClick={onClose}>
      <div className="modal-enter w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-5" onClick={e => e.stopPropagation()}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Create task</h2>
            <p className="mt-1 text-sm text-slate-500">Add a clear owner, priority, and optional deadline.</p>
          </div>
          <button onClick={onClose} className="btn-ghost h-9 w-9 p-0" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Title</label>
            <input
              value={form.title}
              onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
              className="input-field"
              placeholder="Prepare launch checklist"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              className="input-field min-h-28"
              placeholder="Add the context someone needs to start."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Assign to</label>
              <select
                value={form.assignedTo}
                onChange={e => setForm(prev => ({ ...prev, assignedTo: e.target.value }))}
                className="input-field"
              >
                <option value="">Select member</option>
                {project.members?.map(member => (
                  <option key={member._id} value={member._id}>{member.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Priority</label>
              <select
                value={form.priority}
                onChange={e => setForm(prev => ({ ...prev, priority: e.target.value }))}
                className="input-field"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Deadline</label>
            <input
              type="date"
              value={form.deadline}
              onChange={e => setForm(prev => ({ ...prev, deadline: e.target.value }))}
              className="input-field"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              <Plus size={17} />
              {loading ? 'Creating...' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TaskCard({ task, canManage, onDelete, onStatusChange }) {
  const { user } = useAuth();
  const [updating, setUpdating] = useState(false);
  const isAssignee = task.assignedTo?._id === user?._id;
  const canUpdate = canManage || isAssignee;
  const isOverdue = task.deadline && isPast(new Date(task.deadline)) && task.status !== 'Done';

  const updateStatus = async status => {
    setUpdating(true);
    try {
      const res = await api.put(`/tasks/${task._id}`, { status });
      onStatusChange(res.data.task);
    } catch {
      alert('Failed to update task status.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 transition duration-200 hover:border-slate-300">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold leading-5 text-slate-900">{task.title}</h3>
        <span className={priorityClass(task.priority)}>{task.priority}</span>
      </div>

      {task.description && <p className="mb-4 line-clamp-2 text-sm leading-6 text-slate-500">{task.description}</p>}

      <div className="space-y-2 text-xs font-semibold text-slate-500">
        <p className="flex items-center gap-2">
          <Circle size={8} className="fill-slate-300 text-slate-300" />
          {task.assignedTo?.name || 'Unknown'}
        </p>
        {task.deadline && (
          <p className={`flex items-center gap-2 ${isOverdue ? 'text-red-600' : ''}`}>
            <CalendarClock size={14} />
            {isOverdue ? 'Overdue: ' : 'Due: '}
            {format(new Date(task.deadline), 'MMM d, yyyy')}
          </p>
        )}
      </div>

      {canUpdate && (
        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-bold uppercase text-slate-400">Status</label>
          <select
            value={task.status}
            onChange={e => updateStatus(e.target.value)}
            disabled={updating}
            className="input-field"
          >
            {STATUSES.map(status => <option key={status}>{status}</option>)}
          </select>
        </div>
      )}

      {canManage && (
        <button onClick={() => onDelete(task._id)} className="btn-danger mt-3 min-h-9 w-full">
          <Trash2 size={15} />
          Delete task
        </button>
      )}
    </article>
  );
}

function Column({ status, tasks, canManage, onDelete, onStatusChange }) {
  const meta = statusMeta[status];

  return (
    <section className="flex min-h-[420px] flex-col rounded-lg border border-slate-200 bg-slate-50/80">
      <div className={`flex items-center justify-between rounded-t-lg border-b border-slate-200 px-4 py-3 ${meta.header}`}>
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} />
          <h2 className="text-sm font-semibold text-slate-900">{status}</h2>
        </div>
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">{tasks.length}</span>
      </div>
      <div className="flex-1 space-y-3 p-3">
        {tasks.length === 0 ? (
          <div className="flex h-full min-h-52 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white/70 p-4 text-center text-sm font-semibold text-slate-400">
            No tasks here
          </div>
        ) : (
          tasks.map(task => (
            <TaskCard
              key={task._id}
              task={task}
              canManage={canManage}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          ))
        )}
      </div>
    </section>
  );
}

export default function TaskBoardPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectRes, taskRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get(`/tasks?projectId=${id}`),
        ]);
        setProject(projectRes.data.project);
        setTasks(taskRes.data.tasks);
      } catch {
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const isOwner = project?.createdBy?._id === user?._id;
  const canManage = user?.role === 'admin' && isOwner;
  const filteredTasks = useMemo(() => (
    filter === 'mine'
      ? tasks.filter(task => task.assignedTo?._id === user?._id)
      : tasks
  ), [filter, tasks, user?._id]);

  if (loading) return <div className="panel p-5 text-sm font-semibold text-slate-600">Loading board...</div>;
  if (!project) return <div className="panel border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">Project not found.</div>;

  const handleCreate = task => setTasks(prev => [task, ...prev]);
  const handleStatusChange = updatedTask => {
    setTasks(prev => prev.map(task => task._id === updatedTask._id ? updatedTask : task));
  };
  const handleDelete = async taskId => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(task => task._id !== taskId));
    } catch {
      alert('Failed to delete task.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 text-sm font-semibold text-slate-500">
            <Link to="/projects" className="hover:text-blue-700">Projects</Link>
            <span> / {project.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Task board</h1>
          <p className="mt-2 text-sm text-slate-500">{filteredTasks.length} visible tasks from {tasks.length} total</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
            <button
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'btn-primary min-h-9 shadow-none' : 'btn-ghost min-h-9'}
            >
              <ListFilter size={16} />
              All
            </button>
            <button
              onClick={() => setFilter('mine')}
              className={filter === 'mine' ? 'btn-primary min-h-9 shadow-none' : 'btn-ghost min-h-9'}
            >
              My tasks
            </button>
          </div>
          {canManage && (
            <button onClick={() => setShowCreate(true)} className="btn-primary">
              <Plus size={17} />
              Add task
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {STATUSES.map(status => (
          <Column
            key={status}
            status={status}
            tasks={filteredTasks.filter(task => task.status === status)}
            canManage={canManage}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>

      {showCreate && (
        <CreateTaskModal project={project} onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      )}
    </div>
  );
}
