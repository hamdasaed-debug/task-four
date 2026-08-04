const { VALID_STATUSES } = require('../models/taskModel');

/**
 * Validates the body for POST /tasks (create).
 * title is mandatory and must be a non-empty string.
 */
function validateCreate(req, res, next) {
  const { title, description, status } = req.body || {};
  const errors = [];

  if (title === undefined || title === null || String(title).trim() === '') {
    errors.push('title is required and cannot be empty.');
  } else if (typeof title !== 'string') {
    errors.push('title must be a string.');
  }

  if (description !== undefined && description !== null && typeof description !== 'string') {
    errors.push('description must be a string.');
  }

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}.`);
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  next();
}

/**
 * Validates the body for PUT/PATCH /tasks/:id (update).
 * At least one valid field must be present. If title is provided, it cannot be empty.
 */
function validateUpdate(req, res, next) {
  const { title, description, status } = req.body || {};
  const errors = [];

  const hasTitle = Object.prototype.hasOwnProperty.call(req.body || {}, 'title');
  const hasDescription = Object.prototype.hasOwnProperty.call(req.body || {}, 'description');
  const hasStatus = Object.prototype.hasOwnProperty.call(req.body || {}, 'status');

  if (!hasTitle && !hasDescription && !hasStatus) {
    errors.push('At least one of title, description, or status must be provided.');
  }

  if (hasTitle) {
    if (title === null || String(title).trim() === '') {
      errors.push('title cannot be empty.');
    } else if (typeof title !== 'string') {
      errors.push('title must be a string.');
    }
  }

  if (hasDescription && description !== null && typeof description !== 'string') {
    errors.push('description must be a string.');
  }

  if (hasStatus && !VALID_STATUSES.includes(status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}.`);
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  next();
}

/**
 * Validates that :id route param is a positive integer.
 */
function validateIdParam(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid task id. It must be a positive integer.' });
  }
  next();
}

module.exports = { validateCreate, validateUpdate, validateIdParam };
