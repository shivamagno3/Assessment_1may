const express = require('express');
const { body } = require('express-validator');
const {
  createProject, getProjects, getProject, addMember, removeMember, deleteProject
} = require('../controllers/projectController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', adminOnly, [
  body('name').trim().notEmpty().withMessage('Project name is required').isLength({ max: 100 }),
  body('description').optional().isLength({ max: 500 })
], createProject);

router.get('/', getProjects);
router.get('/:id', getProject);

router.post('/:id/members', adminOnly, addMember);
router.delete('/:id/members/:memberId', adminOnly, removeMember);
router.delete('/:id', adminOnly, deleteProject);

module.exports = router;