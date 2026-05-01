import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, FolderKanban, ListTodo } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import StatCard from "../components/StatCard";
import TaskTable from "../components/TaskTable";

export default function DashboardPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    todo: 0,
    progress: 0,
    done: 0,
    overdue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/dashboard");
        const data = res.data;
        const nextStats = data.stats || {};

        setTasks(data.recentTasks || []);
        setStats({
          total: nextStats.total || 0,
          todo: nextStats.todo || 0,
          progress: nextStats.inProgress || 0,
          done: nextStats.completed || 0,
          overdue: nextStats.overdue || 0,
        });
      } catch {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const completion = useMemo(() => {
    if (!stats.total) return 0;
    return Math.round((stats.done / stats.total) * 100);
  }, [stats.done, stats.total]);

  if (loading) {
    return (
      <div className="panel p-6">
        <div className="h-5 w-44 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="panel border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>;
  }

  const firstName = user?.name?.split(" ")[0] || "User";

  return (
    <div className="space-y-6">
      <section className="panel p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome, {firstName}</h1>
            <p className="mt-1 text-sm text-slate-500">
              Track your tasks and project progress.
            </p>
          </div>
          <span className="text-sm font-semibold text-slate-600">{completion}% complete</span>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Tasks" value={stats.total} icon={ListTodo} tone="blue" helper="All assigned work" />
        <StatCard label="To Do" value={stats.todo} icon={Clock3} tone="amber" helper="Ready to start" />
        <StatCard label="In Progress" value={stats.progress} icon={FolderKanban} tone="teal" helper="Actively moving" />
        <StatCard label="Completed" value={stats.done} icon={CheckCircle2} tone="green" helper="Closed tasks" />
        <StatCard label="Overdue" value={stats.overdue} icon={AlertTriangle} tone="rose" helper="Needs attention" />
      </div>

      <section className="panel p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Overall Progress</h2>
            <p className="text-sm text-slate-500">Completed tasks compared with total workload.</p>
          </div>
          <span className="text-sm font-semibold text-blue-700">{completion}% complete</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-blue-600 transition-all duration-500" style={{ width: `${completion}%` }} />
        </div>
      </section>

      <section className="panel p-5">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Recent Tasks</h2>
            <p className="text-sm text-slate-500">Latest assignments and status updates.</p>
          </div>
          <p className="text-sm font-semibold text-slate-500">{tasks.length} shown</p>
        </div>
        <TaskTable tasks={tasks} />
      </section>
    </div>
  );
}
