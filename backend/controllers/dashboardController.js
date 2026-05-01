const Task = require('../models/Task');
const Project = require('../models/Project');

const getDashboard = async (req, res) => {
  try {
    const now = new Date();
    let taskFilter = {};

    if (req.user.role === 'member') {
      taskFilter.assignedTo = req.user._id;
    } else {
      const adminProjects = await Project.find({ createdBy: req.user._id }).select('_id');
      const projectIds = adminProjects.map(p => p._id);
      taskFilter.projectId = { $in: projectIds };
    }

    const [total, completed, inProgress, todo, overdue] = await Promise.all([
      Task.countDocuments(taskFilter),
      Task.countDocuments({ ...taskFilter, status: 'Done' }),
      Task.countDocuments({ ...taskFilter, status: 'In Progress' }),
      Task.countDocuments({ ...taskFilter, status: 'Todo' }),
      Task.countDocuments({
        ...taskFilter,
        status: { $ne: 'Done' },
        deadline: { $lt: now }
      })
    ]);

    const recentTasks = await Task.find(taskFilter)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    let projectCount = 0;
    if (req.user.role === 'admin') {
      projectCount = await Project.countDocuments({ createdBy: req.user._id });
    } else {
      projectCount = await Project.countDocuments({ members: req.user._id });
    }

    res.json({
      stats: { total, completed, inProgress, todo, overdue, projectCount },
      recentTasks
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard data.' });
  }
};

module.exports = { getDashboard };