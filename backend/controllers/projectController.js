const { validationResult } = require('express-validator');
const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');

const createProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { name, description } = req.body;

    const project = await Project.create({
      name,
      description,
      createdBy: req.user._id,
      members: [req.user._id]
    });

    await project.populate('createdBy', 'name email');
    await project.populate('members', 'name email role');

    res.status(201).json({ message: 'Project created.', project });
  } catch (error) {
    res.status(500).json({ message: 'Error creating project.' });
  }
};

const getProjects = async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'admin') {
      projects = await Project.find({ createdBy: req.user._id })
        .populate('createdBy', 'name email')
        .populate('members', 'name email role')
        .sort({ createdAt: -1 });
    } else {
      projects = await Project.find({ members: req.user._id })
        .populate('createdBy', 'name email')
        .populate('members', 'name email role')
        .sort({ createdAt: -1 });
    }
    res.json({ projects });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects.' });
  }
};

const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    if (!project) return res.status(404).json({ message: 'Project not found.' });

    const isMember = project.members.some(m => m._id.toString() === req.user._id.toString());
    if (!isMember && project.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.json({ project });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project.' });
  }
};

const addMember = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only project owner can add members.' });
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) return res.status(404).json({ message: 'User not found with that email.' });

    if (project.members.includes(userToAdd._id)) {
      return res.status(400).json({ message: 'User is already a member.' });
    }

    project.members.push(userToAdd._id);
    await project.save();
    await project.populate('members', 'name email role');
    await project.populate('createdBy', 'name email');

    res.json({ message: 'Member added.', project });
  } catch (error) {
    res.status(500).json({ message: 'Error adding member.' });
  }
};

const removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only project owner can remove members.' });
    }

    const { memberId } = req.params;
    if (memberId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot remove project owner.' });
    }

    project.members = project.members.filter(m => m.toString() !== memberId);
    await project.save();
    await project.populate('members', 'name email role');
    await project.populate('createdBy', 'name email');

    res.json({ message: 'Member removed.', project });
  } catch (error) {
    res.status(500).json({ message: 'Error removing member.' });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only project owner can delete it.' });
    }

    await Task.deleteMany({ projectId: req.params.id });
    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: 'Project deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project.' });
  }
};

module.exports = { createProject, getProjects, getProject, addMember, removeMember, deleteProject };