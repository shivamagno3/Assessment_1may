const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');

const createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { title, description, assignedTo, projectId, deadline, priority } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    const isMember = project.members.some(m => m.toString() === assignedTo);
    if (!isMember) {
      return res.status(400).json({ message: 'Assigned user is not a project member.' });
    }

    const canCreate = req.user.role === 'admin' &&
      project.createdBy.toString() === req.user._id.toString();

    if (!canCreate) {
      return res.status(403).json({ message: 'Not authorized to create tasks in this project.' });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo,
      projectId,
      deadline,
      priority: priority || 'Medium',
      createdBy: req.user._id
    });

    await task.populate('assignedTo', 'name email');
    await task.populate('projectId', 'name');
    await task.populate('createdBy', 'name email');

    res.status(201).json({ message: 'Task created.', task });
  } catch (error) {
    res.status(500).json({ message: 'Error creating task.' });
  }
};

const getTasks = async (req, res) => {
  try {
    const { projectId, status } = req.query;
    let filter = {};

    if (projectId) {
      const project = await Project.findById(projectId);
      if (!project) return res.status(404).json({ message: 'Project not found.' });

      const isMember = project.members.some(m => m.toString() === req.user._id.toString());
      const isOwner = project.createdBy.toString() === req.user._id.toString();
      if (!isMember && !isOwner) {
        return res.status(403).json({ message: 'Access denied.' });
      }
      filter.projectId = projectId;
    } else {
      if (req.user.role === 'member') {
        filter.assignedTo = req.user._id;
      }
    }

    if (status) filter.status = status;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'name')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks.' });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    const project = await Project.findById(task.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    const isOwner = project.createdBy.toString() === req.user._id.toString();
    const isAssignee = task.assignedTo.toString() === req.user._id.toString();
    const isAdminOwner = req.user.role === 'admin' && isOwner;

    if (!isAdminOwner && !isAssignee) {
      return res.status(403).json({ message: 'Not authorized to update this task.' });
    }

    const allowedUpdates = ['status'];
    if (isAdminOwner) {
      allowedUpdates.push('title', 'description', 'assignedTo', 'deadline', 'priority');
    }

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('projectId', 'name');
    await task.populate('createdBy', 'name email');

    res.json({ message: 'Task updated.', task });
  } catch (error) {
    res.status(500).json({ message: 'Error updating task.' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    const project = await Project.findById(task.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    const isOwner = project.createdBy.toString() === req.user._id.toString();

    if (!isOwner || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this task.' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task.' });
  }
};

module.exports = { createTask, getTasks, updateTask, deleteTask };
