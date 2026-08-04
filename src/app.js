const express = require('express');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Task Manager API is running.' });
});

app.use('/tasks', taskRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found.` });
});

// Malformed JSON body handler
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Malformed JSON in request body.' });
  }
  console.error(err);
  return res.status(500).json({ error: 'Internal server error.' });
});

module.exports = app;
