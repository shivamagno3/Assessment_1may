import { format, isPast } from 'date-fns';
import { CalendarClock, ClipboardList } from 'lucide-react';

const statusClass = status => ({
  Todo: 'badge badge-todo',
  'In Progress': 'badge badge-progress',
  Done: 'badge badge-done',
}[status] || 'badge badge-todo');

const priorityClass = priority => ({
  High: 'badge-high',
  Medium: 'badge-medium',
  Low: 'badge-low',
}[priority] || 'badge-low');

export default function TaskTable({ tasks }) {
  if (!tasks?.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
          <ClipboardList size={21} />
        </div>
        <p className="font-bold text-slate-800">No tasks yet</p>
        <p className="mt-1 max-w-sm text-sm text-slate-500">Assigned tasks will appear here once your team starts planning work.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <th className="px-4 py-3 font-bold">Task</th>
              <th className="px-4 py-3 font-bold">Project</th>
              <th className="px-4 py-3 font-bold">Assignee</th>
              <th className="px-4 py-3 font-bold">Priority</th>
              <th className="px-4 py-3 font-bold">Deadline</th>
              <th className="px-4 py-3 font-bold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {tasks.map(task => {
              const overdue = task.deadline && isPast(new Date(task.deadline)) && task.status !== 'Done';
              return (
                <tr key={task._id} className="transition-colors hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <p className="font-bold text-slate-950">{task.title}</p>
                    {task.description && <p className="mt-1 line-clamp-1 text-xs text-slate-500">{task.description}</p>}
                  </td>
                  <td className="px-4 py-4 text-slate-600">{task.projectId?.name || '-'}</td>
                  <td className="px-4 py-4 text-slate-600">{task.assignedTo?.name || '-'}</td>
                  <td className="px-4 py-4"><span className={priorityClass(task.priority)}>{task.priority}</span></td>
                  <td className={`px-4 py-4 ${overdue ? 'font-bold text-red-600' : 'text-slate-600'}`}>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarClock size={14} />
                      {task.deadline ? `${overdue ? 'Overdue: ' : ''}${format(new Date(task.deadline), 'MMM d, yyyy')}` : '-'}
                    </span>
                  </td>
                  <td className="px-4 py-4"><span className={statusClass(task.status)}>{task.status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
