const db = require('../db');

const VALID_STATUSES = ['pending', 'completed'];

const statements = {
  insert: db.prepare(`
    INSERT INTO tasks (title, description, status)
    VALUES (@title, @description, @status)
  `),
  findAll: db.prepare(`SELECT * FROM tasks ORDER BY created_at DESC, id DESC`),
  findById: db.prepare(`SELECT * FROM tasks WHERE id = ?`),
  deleteById: db.prepare(`DELETE FROM tasks WHERE id = ?`),
};

function buildUpdateStatement(fields) {
  const setClause = fields.map((f) => `${f} = @${f}`).join(', ');
  return db.prepare(`UPDATE tasks SET ${setClause} WHERE id = @id`);
}

const TaskModel = {
  VALID_STATUSES,

  create({ title, description, status }) {
    const result = statements.insert.run({
      title,
      description: description ?? null,
      status: status ?? 'pending',
    });
    return statements.findById.get(result.lastInsertRowid);
  },

  findAll({ status } = {}) {
    if (status) {
      return db
        .prepare(`SELECT * FROM tasks WHERE status = ? ORDER BY created_at DESC, id DESC`)
        .all(status);
    }
    return statements.findAll.all();
  },

  findById(id) {
    return statements.findById.get(id);
  },

  update(id, fields) {
    const keys = Object.keys(fields);
    if (keys.length === 0) return this.findById(id);

    const stmt = buildUpdateStatement(keys);
    stmt.run({ id, ...fields });
    return this.findById(id);
  },

  remove(id) {
    const result = statements.deleteById.run(id);
    return result.changes > 0;
  },
};

module.exports = TaskModel;
