# Task Manager API

A RESTful **Task Manager API** built with **Node.js**, **Express**, and **SQLite** (via `better-sqlite3`). It supports full CRUD operations on tasks, with input validation, proper HTTP status codes, and a persistent on-disk database.

## Features

- Full CRUD: create, read (list + single), update (PUT/PATCH), delete
- SQLite database with a schema-enforced `status` field (`pending` | `completed`)
- Validation: `title` is required and cannot be empty on create/update
- Consistent error responses with appropriate HTTP status codes (`400`, `404`, `500`)
- Optional filtering: `GET /tasks?status=pending`
- Automated test suite (Jest + Supertest) covering happy paths and edge cases
- Postman collection included for manual testing

## Tech Stack

| Layer      | Choice                          |
|------------|----------------------------------|
| Runtime    | Node.js                          |
| Framework  | Express 5                        |
| Database   | SQLite (`better-sqlite3`)        |
| Testing    | Jest + Supertest                 |

## Project Structure

```
task-manager-api/
├── src/
│   ├── app.js                    # Express app (routes, middleware, error handling)
│   ├── server.js                 # Entry point — starts the HTTP server
│   ├── db.js                     # SQLite connection + schema (auto-creates the table)
│   ├── controllers/
│   │   └── taskController.js     # CRUD business logic
│   ├── models/
│   │   └── taskModel.js          # SQL queries for the tasks table
│   ├── routes/
│   │   └── taskRoutes.js         # /tasks route definitions
│   └── validators/
│       └── taskValidator.js      # Request validation middleware
├── tests/
│   └── tasks.test.js             # Automated API tests (Jest + Supertest)
├── data/                         # SQLite database file lives here (auto-created, gitignored)
├── postman_collection.json       # Importable Postman collection
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Data Model

Each task has the following fields:

| Field         | Type     | Notes                                              |
|---------------|----------|-----------------------------------------------------|
| `id`          | integer  | Auto-generated, primary key                        |
| `title`       | string   | **Required**, cannot be empty                       |
| `description` | string   | Optional                                            |
| `status`      | string   | `pending` (default) or `completed`                  |
| `created_at`  | string   | ISO-8601 timestamp, auto-generated on creation      |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (comes with Node.js)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/task-manager-api.git
cd task-manager-api

# 2. Install dependencies
npm install

# 3. (Optional) copy the example env file
cp .env.example .env
```

### Running the server

```bash
npm start
```

The API will be available at `http://localhost:3000` (or the port set in `.env`).

The SQLite database file is created automatically at `data/tasks.db` the first time the server runs — no manual database setup is required.

### Running the tests

```bash
npm test
```

This runs the Jest + Supertest suite against a separate, disposable test database (`tests/test-tasks.db`), so it never touches your development data.

## API Reference

Base URL: `http://localhost:3000`

### Create a task

```
POST /tasks
Content-Type: application/json

{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "status": "pending"
}
```

- `title` is required.
- `description` and `status` are optional (`status` defaults to `pending`).

**Success — `201 Created`**
```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "status": "pending",
  "created_at": "2026-08-04T16:13:47.363Z"
}
```

**Error — `400 Bad Request`** (empty/missing title)
```json
{ "error": "Validation failed", "details": ["title is required and cannot be empty."] }
```

### Get all tasks

```
GET /tasks
GET /tasks?status=pending   # optional filter
```

**Success — `200 OK`** → array of task objects.

### Get a single task

```
GET /tasks/:id
```

- **`200 OK`** → the task object.
- **`404 Not Found`** → `{ "error": "Task with id 5 not found." }`
- **`400 Bad Request`** → if `:id` is not a positive integer.

### Update a task

```
PUT /tasks/:id
PATCH /tasks/:id
Content-Type: application/json

{ "title": "Buy groceries and cook dinner", "status": "completed" }
```

- `PUT` and `PATCH` behave the same way here: only the fields you send are updated.
- At least one of `title`, `description`, or `status` must be provided.
- If `title` is included, it cannot be empty.

- **`200 OK`** → the updated task.
- **`404 Not Found`** → task doesn't exist.
- **`400 Bad Request`** → invalid/empty body.

### Delete a task

```
DELETE /tasks/:id
```

- **`204 No Content`** → deleted successfully.
- **`404 Not Found`** → task doesn't exist.

## Error Handling

All errors are returned as JSON with a descriptive message:

| Status | Meaning                                      |
|--------|-----------------------------------------------|
| 400    | Validation error (bad input, malformed JSON) |
| 404    | Resource not found                            |
| 500    | Unexpected server error                       |

## Testing with Postman

1. Open Postman → **Import** → select `postman_collection.json` from this repo.
2. Start the server (`npm start`).
3. Run requests in the collection, in order (Create → Get All → Get One → Update → Delete), adjusting the `taskId` collection variable as needed.

## Notes on Design Choices

- **`better-sqlite3`** was chosen for a simple, synchronous, zero-config embedded database — no separate DB server to install, while still being a real persistent SQL database (not an in-memory array).
- The **model / controller / route / validator** layers are separated to keep the codebase easy to extend (e.g., swapping SQLite for Postgres would only require changes in `db.js` and `taskModel.js`).
- `PUT` and `PATCH` are both wired to the same partial-update handler for simplicity; only fields present in the request body are changed.
