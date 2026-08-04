const TaskModel = require('../models/taskModel');

// POST /tasks
function createTask(req, res) {
  const { title, description, status } = req.body;
  const task = TaskModel.create({
    title: title.trim(),
    description: description ?? null,
    status: status ?? 'pending',
  });
  return res.status(201).json(task);
}

// GET /tasks  (optional ?status=pending|completed filter)
function getAllTasks(req, res) {
  const { status } = req.query;

  if (status && !TaskModel.VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: 'Validation failed',
      details: [`status query param must be one of: ${TaskModel.VALID_STATUSES.join(', ')}.`],
    });
  }

  const tasks = TaskModel.findAll({ status });
  return res.status(200).json(tasks);
}

// GET /tasks/:id
function getTaskById(req, res) {
  const task = TaskModel.findById(Number(req.params.id));
  if (!task) {
    return res.status(404).json({ error: `Task with id ${req.params.id} not found.` });
  }
  return res.status(200).json(task);
}

// PUT /tasks/:id and PATCH /tasks/:id
function updateTask(req, res) {
  const id = Number(req.params.id);
  const existing = TaskModel.findById(id);

  if (!existing) {
    return res.status(404).json({ error: `Task with id ${id} not found.` });
  }

  const fields = {};
  if (Object.prototype.hasOwnProperty.call(req.body, 'title')) {
    fields.title = req.body.title.trim();
  }
  if (Object.prototype.hasOwnProperty.call(req.body, 'description')) {
    fields.description = req.body.description;
  }
  if (Object.prototype.hasOwnProperty.call(req.body, 'status')) {
    fields.status = req.body.status;
  }

  const updated = TaskModel.update(id, fields);
  return res.status(200).json(updated);
}

// DELETE /tasks/:id
function deleteTask(req, res) {
  const id = Number(req.params.id);
  const existing = TaskModel.findById(id);

  if (!existing) {
    return res.status(404).json({ error: `Task with id ${id} not found.` });
  }

  TaskModel.remove(id);
  return res.status(204).send();
}

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
