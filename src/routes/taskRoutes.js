const express = require('express');
const taskController = require('../controllers/taskController');
const {
  validateCreate,
  validateUpdate,
  validateIdParam,
} = require('../validators/taskValidator');

const router = express.Router();

router.post('/', validateCreate, taskController.createTask);
router.get('/', taskController.getAllTasks);
router.get('/:id', validateIdParam, taskController.getTaskById);
router.put('/:id', validateIdParam, validateUpdate, taskController.updateTask);
router.patch('/:id', validateIdParam, validateUpdate, taskController.updateTask);
router.delete('/:id', validateIdParam, taskController.deleteTask);

module.exports = router;
