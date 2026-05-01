const express = require('express');
const { body } = require('express-validator');
const { createTask, getTasks, updateTask, deleteTask } = require('../controllers/taskcontroller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', [
  body('title').trim().notEmpty().withMessage('Task title is required').isLength({ max: 150 }),
  body('description').optional().isLength({ max: 1000 }),
  body('assignedTo').notEmpty().withMessage('Assigned user is required').isMongoId(),
  body('projectId').notEmpty().withMessage('Project is required').isMongoId(),
  body('deadline').optional().isISO8601().withMessage('Invalid deadline date'),
  body('priority').optional().isIn(['Low', 'Medium', 'High'])
], createTask);

router.get('/', getTasks);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
