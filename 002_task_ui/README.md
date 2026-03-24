# Task Manager UI

Angular frontend for the Task Management System — Atlassian-style, clean, minimal design.

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Angular | 17+ | SPA framework (standalone components) |
| TypeScript | 5.4 | Type-safe development |
| Reactive Forms | — | Form handling with validation |
| HttpClient | — | REST API communication |
| Nginx | Alpine | Production web server + reverse proxy |
| Docker | — | Containerization |

---

## Design System

Follows a clean **Atlassian / Jira style** UI with the **70 / 20 / 10 rule**:

- **70%** white space
- **20%** content
- **10%** accent color

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#FFFFFF` | Page background |
| Primary Blue | `#2684FF` | Buttons, icons, links |
| Dark Blue | `#0F3D91` | Hover states |
| Accent Orange | `#FFAB00` | Highlights, completed badge |
| Light Orange | `#FFE7BA` | Completed task card tint |
| Card Background | `#F4F5F7` | Card surfaces |
| Primary Text | `#172B4D` | Titles, body text |
| Secondary Text | `#6B778C` | Subtitles, timestamps |
| Divider | `#DFE1E6` | Card borders, separators |

### Typography

- **Font:** Segoe UI (system font stack)
- **Titles:** Large, bold, `#172B4D`
- **Subtitles:** Medium weight, `#6B778C`
- **Body:** Short sentences, max 10 words per line

### Icons

Simple emoji-based, flat, friendly:

| Icon | Meaning |
|------|---------|
| 📋 | App / Task Manager |
| 👤 | User |
| 📌 | Pending task |
| ✅ | Complete action |
| ✔ | Done badge |
| ➕ | Add task |
| 📭 | Empty state |
| 🕐 | Timestamp |

---

## Project Structure

```
002_task_ui/
├── angular.json                  ← Angular CLI configuration
├── package.json                  ← Dependencies
├── tsconfig.json                 ← TypeScript config
├── tsconfig.app.json             ← App-specific TS config
├── Dockerfile                    ← Multi-stage build (Node → Nginx)
├── nginx.conf                    ← Nginx config (SPA + API proxy)
├── .gitignore
│
└── src/
    ├── index.html                ← Entry HTML
    ├── main.ts                   ← Bootstrap with providers
    ├── styles.css                ← Design tokens + global styles
    │
    └── app/
        ├── app.component.ts      ← App shell (header + user input)
        ├── app.component.html
        ├── app.component.css
        ├── app.routes.ts         ← Route configuration
        │
        ├── models/
        │   └── task.model.ts     ← Task & TaskRequest interfaces
        │
        ├── services/
        │   └── task.service.ts   ← API calls (add, get, complete)
        │
        ├── components/
        │   ├── task-form/        ← Reactive form (title + description)
        │   │   ├── task-form.component.ts
        │   │   ├── task-form.component.html
        │   │   └── task-form.component.css
        │   │
        │   └── task-list/        ← Card list (pending + completed)
        │       ├── task-list.component.ts
        │       ├── task-list.component.html
        │       └── task-list.component.css
        │
        └── environments/
            ├── environment.ts        ← Dev: apiUrl → localhost:8080
            └── environment.prod.ts   ← Prod: apiUrl → empty (Nginx proxies)
```

---

## Components

### App Shell (`app.component`)

- Header with app title: "📋 Task Manager"
- User ID input field (top-right) — editable, defaults to `user-001`
- Hosts task-form and task-list components

### Task Form (`task-form.component`)

- Card-based layout
- Reactive form with two fields:
  - **Title** — required, min 2 characters
  - **Description** — optional
- "➕ Add Task" button — disabled when invalid or submitting
- Emits `taskAdded` event to refresh the list

### Task List (`task-list.component`)

- Displays "Your Tasks" with count
- **Pending tasks:** White cards with "✅ Complete" button
- **Completed tasks:** Orange-tinted cards with "✔ Done" badge, strikethrough title
- Empty state: "📭 No tasks yet! Add one above."
- Auto-refreshes when a task is added or userId changes

---

## API Integration

| Action | Method | Endpoint | Trigger |
|--------|--------|----------|---------|
| Add Task | `POST` | `/api/v1/tasks` | Form submit |
| View Tasks | `GET` | `/api/v1/tasks?userId={id}` | On load + after add |
| Complete Task | `PATCH` | `/api/v1/tasks/{id}/complete` | Button click |

`TaskService` handles all HTTP calls using Angular's `HttpClient`.

API base URL:
- **Dev:** `http://localhost:8080` (direct, via CORS)
- **Prod:** empty string (Nginx proxies `/api/` to backend)

---

## Nginx Configuration

Nginx serves two roles inside the Docker container:

### 1. Static File Server

Serves the compiled Angular build (`index.html`, JS, CSS).

### 2. Reverse Proxy

Forwards `/api/*` requests to the Spring Boot backend:

```
Browser → http://localhost/api/v1/tasks
            │
            ▼
       Nginx (port 80)
            │
            ▼  proxy_pass
       task-service:8080/api/v1/tasks
```

### 3. SPA Routing

All unknown routes fall back to `index.html` so Angular handles routing:

```
try_files $uri $uri/ /index.html;
```

---

## Running

### With Docker Compose (from project root)

```bash
docker-compose up --build -d
```

Access at: **http://localhost**

### Local Development (without Docker)

```bash
cd 002_task_ui
npm install
ng serve
```

Access at: **http://localhost:4200**

Backend must be running at `http://localhost:8080` (via Docker or locally).

---

## Docker Build

Multi-stage Dockerfile:

| Stage | Base Image | Action |
|-------|-----------|--------|
| 1 — Build | `node:18-alpine` | `npm install` + `ng build --prod` |
| 2 — Serve | `nginx:alpine` | Copy build output + nginx.conf |

Final image serves the app on **port 80**.
