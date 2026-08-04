const fs = require('fs');
const path = require('path');

// Use a dedicated, disposable SQLite file for tests so we never touch dev data.
const TEST_DB_PATH = path.join(__dirname, 'test-tasks.db');
process.env.DB_PATH = TEST_DB_PATH;

const request = require('supertest');
const app = require('../src/app');

beforeAll(() => {
  for (const ext of ['', '-wal', '-shm']) {
    const f = TEST_DB_PATH + ext;
    if (fs.existsSync(f)) fs.unlinkSync(f);
  }
});

afterAll(() => {
  for (const ext of ['', '-wal', '-shm']) {
    const f = TEST_DB_PATH + ext;
    if (fs.existsSync(f)) fs.unlinkSync(f);
  }
});

describe('POST /tasks', () => {
  it('creates a task with just a title', async () => {
    const res = await request(app).post('/tasks').send({ title: 'Buy groceries' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      title: 'Buy groceries',
      description: null,
      status: 'pending',
    });
    expect(res.body.id).toBeDefined();
    expect(res.body.created_at).toBeDefined();
  });

  it('creates a task with all fields', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Write report', description: 'Q3 summary', status: 'completed' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      title: 'Write report',
      description: 'Q3 summary',
      status: 'completed',
    });
  });

  it('rejects an empty title', async () => {
    const res = await request(app).post('/tasks').send({ title: '   ' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('rejects a missing title', async () => {
    const res = await request(app).post('/tasks').send({ description: 'no title here' });
    expect(res.status).toBe(400);
  });

  it('rejects an invalid status', async () => {
    const res = await request(app).post('/tasks').send({ title: 'x', status: 'archived' });
    expect(res.status).toBe(400);
  });
});

describe('GET /tasks', () => {
  it('returns an array of tasks', async () => {
    await request(app).post('/tasks').send({ title: 'Task A' });
    const res = await request(app).get('/tasks');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('filters by status query param', async () => {
    await request(app).post('/tasks').send({ title: 'Done task', status: 'completed' });
    const res = await request(app).get('/tasks?status=completed');
    expect(res.status).toBe(200);
    expect(res.body.every((t) => t.status === 'completed')).toBe(true);
  });

  it('rejects an invalid status filter', async () => {
    const res = await request(app).get('/tasks?status=bogus');
    expect(res.status).toBe(400);
  });
});

describe('GET /tasks/:id', () => {
  it('returns a single task', async () => {
    const created = await request(app).post('/tasks').send({ title: 'Find me' });
    const res = await request(app).get(`/tasks/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(created.body.id);
  });

  it('returns 404 for a non-existent task', async () => {
    const res = await request(app).get('/tasks/999999');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  it('returns 400 for a non-numeric id', async () => {
    const res = await request(app).get('/tasks/abc');
    expect(res.status).toBe(400);
  });
});

describe('PUT /tasks/:id', () => {
  it('updates an existing task', async () => {
    const created = await request(app).post('/tasks').send({ title: 'Old title' });
    const res = await request(app)
      .put(`/tasks/${created.body.id}`)
      .send({ title: 'New title', status: 'completed' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('New title');
    expect(res.body.status).toBe('completed');
  });

  it('rejects clearing the title', async () => {
    const created = await request(app).post('/tasks').send({ title: 'Keep me' });
    const res = await request(app).put(`/tasks/${created.body.id}`).send({ title: '' });
    expect(res.status).toBe(400);
  });

  it('returns 404 when updating a non-existent task', async () => {
    const res = await request(app).put('/tasks/999999').send({ title: 'Nope' });
    expect(res.status).toBe(404);
  });
});

describe('PATCH /tasks/:id', () => {
  it('partially updates a task (status only)', async () => {
    const created = await request(app).post('/tasks').send({ title: 'Partial update me' });
    const res = await request(app)
      .patch(`/tasks/${created.body.id}`)
      .send({ status: 'completed' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('completed');
    expect(res.body.title).toBe('Partial update me');
  });

  it('rejects an empty body', async () => {
    const created = await request(app).post('/tasks').send({ title: 'Needs a field' });
    const res = await request(app).patch(`/tasks/${created.body.id}`).send({});
    expect(res.status).toBe(400);
  });
});

describe('DELETE /tasks/:id', () => {
  it('deletes an existing task', async () => {
    const created = await request(app).post('/tasks').send({ title: 'Delete me' });
    const del = await request(app).delete(`/tasks/${created.body.id}`);
    expect(del.status).toBe(204);

    const getAfter = await request(app).get(`/tasks/${created.body.id}`);
    expect(getAfter.status).toBe(404);
  });

  it('returns 404 when deleting a non-existent task', async () => {
    const res = await request(app).delete('/tasks/999999');
    expect(res.status).toBe(404);
  });
});
