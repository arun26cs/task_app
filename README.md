# Task Management System

A simple, full-stack **Task Management** application built with **Angular**, **Spring Boot**, and **PostgreSQL**, containerized with **Docker** and deployable on **Kubernetes**.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Data Model](#data-model)
- [API Design](#api-design)
- [Operation Flows](#operation-flows)
- [Frontend–Backend Interaction](#frontendbackend-interaction)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Run with Docker Compose](#run-with-docker-compose)
  - [Run Locally (without Docker)](#run-locally-without-docker)
  - [Deploy to Kubernetes](#deploy-to-kubernetes)
- [Assumptions & Simplifications](#assumptions--simplifications)

---

## Architecture Overview

```
┌──────────────────┐       HTTP/REST (JSON)       ┌──────────────────┐       JDBC / JPA       ┌─────────────────┐
│                  │  ◄──────────────────────────► │                  │ ◄──────────────────────►│                 │
│   Angular SPA    │                               │  Spring Boot API │                        │   PostgreSQL    │
│   (Port 4200)    │                               │   (Port 8080)    │                        │   (Port 5432)   │
│                  │                               │                  │                        │                 │
└──────────────────┘                               └──────────────────┘                        └─────────────────┘
     Frontend                                           Backend                                    Database
```

- **Frontend (Angular)** — Single Page Application served via Nginx in production. Communicates with the backend over REST.
- **Backend (Spring Boot)** — Exposes RESTful endpoints, handles business logic, and persists data to PostgreSQL via Spring Data JPA.
- **Database (PostgreSQL)** — Relational database storing task records with audit information.
- **Docker Compose** — Orchestrates all three services (frontend, backend, database) as containers.
- **Kubernetes** — Production-grade deployment manifests for all services.

---

## Tech Stack

| Layer        | Technology                          | Version  |
|--------------|-------------------------------------|----------|
| Frontend     | Angular                             | 17+      |
| Backend      | Java + Spring Boot                  | 17+ / 3.x |
| Database     | PostgreSQL                          | 16       |
| ORM          | Spring Data JPA (Hibernate)         | —        |
| Build Tool   | Maven                               | 3.9+     |
| Containerize | Docker + Docker Compose             | —        |
| Orchestrate  | Kubernetes                          | 1.28+    |
| Web Server   | Nginx (for Angular production build)| —        |

---

## Project Structure

```
002_task_app/
│
├── README.md                          ← You are here
├── docker-compose.yml                 ← Orchestrates 3 containers
├── .gitignore
│
├── 002_task_service/                  ← Spring Boot REST API
│   ├── pom.xml
│   ├── Dockerfile
│   ├── .gitignore
│   └── src/
│       └── main/
│           ├── java/com/pla/task/
│           │   ├── TaskServiceApplication.java
│           │   ├── config/
│           │   │   └── CorsConfig.java
│           │   ├── controller/
│           │   │   └── TaskController.java
│           │   ├── dto/
│           │   │   ├── TaskRequestDTO.java
│           │   │   └── TaskResponseDTO.java
│           │   ├── enums/
│           │   │   └── TaskStatus.java
│           │   ├── exception/
│           │   │   ├── GlobalExceptionHandler.java
│           │   │   └── TaskNotFoundException.java
│           │   ├── model/
│           │   │   ├── AuditableEntity.java
│           │   │   └── Task.java
│           │   ├── repository/
│           │   │   └── TaskRepository.java
│           │   └── service/
│           │       ├── TaskService.java
│           │       └── TaskServiceImpl.java
│           └── resources/
│               └── application.yml
│
├── 002_task_ui/                       ← Angular Frontend
│   ├── Dockerfile
│   ├── angular.json
│   ├── package.json
│   └── src/
│       └── app/
│           ├── components/
│           │   ├── task-list/
│           │   ├── task-form/
│           │   └── task-item/
│           ├── services/
│           │   └── task.service.ts
│           ├── models/
│           │   └── task.model.ts
│           └── environments/
│               ├── environment.ts
│               └── environment.prod.ts
│
└── k8s/                               ← Kubernetes manifests
    ├── namespace.yml
    ├── postgres-deployment.yml
    ├── postgres-service.yml
    ├── backend-deployment.yml
    ├── backend-service.yml
    ├── frontend-deployment.yml
    └── frontend-service.yml
```

---

## Data Model

### Task Entity

| Column        | Type              | Description                        |
|---------------|-------------------|------------------------------------|
| `id`          | `Long` (PK, auto) | Unique task identifier            |
| `title`       | `String`          | Task title (required)              |
| `description` | `String`          | Task description (optional)        |
| `status`      | `Enum`            | `PENDING` or `COMPLETED`           |
| `userId`      | `String`          | Owner of the task                  |

### Audit Fields (inherited from `AuditableEntity`)

| Column        | Type              | Description                        |
|---------------|-------------------|------------------------------------|
| `createdBy`   | `String`          | Who created the record             |
| `updatedBy`   | `String`          | Who last updated the record        |
| `createdAt`   | `LocalDateTime`   | Auto-set on creation               |
| `updatedAt`   | `LocalDateTime`   | Auto-set on every update           |

### Status Enum

```
TaskStatus
├── PENDING       ← Default when a task is created
└── COMPLETED     ← Set when a task is marked complete
```

---

## API Design

Base path: `/api/v1/tasks`

### Endpoints

| Method  | Endpoint                          | Description                 | Request Body                          | Response       |
|---------|-----------------------------------|-----------------------------|---------------------------------------|----------------|
| `POST`  | `/api/v1/tasks`                   | Add a new task              | `{ title, description, userId }`      | `201 Created`  |
| `GET`   | `/api/v1/tasks?userId={userId}`   | View all tasks for a user   | —                                     | `200 OK`       |
| `PATCH` | `/api/v1/tasks/{taskId}/complete` | Mark a task as complete     | `{ userId }`                          | `200 OK`       |

### Sample Request / Response

#### POST — Add Task

```json
// Request
POST /api/v1/tasks
Content-Type: application/json

{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "userId": "user-001"
}

// Response — 201 Created
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "status": "PENDING",
  "userId": "user-001",
  "createdBy": "user-001",
  "updatedBy": "user-001",
  "createdAt": "2026-03-23T10:30:00",
  "updatedAt": "2026-03-23T10:30:00"
}
```

#### GET — View Tasks

```json
// Request
GET /api/v1/tasks?userId=user-001

// Response — 200 OK
[
  {
    "id": 1,
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "status": "PENDING",
    "userId": "user-001",
    "createdBy": "user-001",
    "updatedBy": "user-001",
    "createdAt": "2026-03-23T10:30:00",
    "updatedAt": "2026-03-23T10:30:00"
  }
]
```

#### PATCH — Mark Complete

```json
// Request
PATCH /api/v1/tasks/1/complete
Content-Type: application/json

{
  "userId": "user-001"
}

// Response — 200 OK
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "status": "COMPLETED",
  "userId": "user-001",
  "createdBy": "user-001",
  "updatedBy": "user-001",
  "createdAt": "2026-03-23T10:30:00",
  "updatedAt": "2026-03-23T14:00:00"
}
```

---

## Operation Flows

### 1. Add Task

```
User fills form (Angular)
       │
       ▼
POST /api/v1/tasks  ──► TaskController  ──► TaskService  ──► TaskRepository
       │                                       │                    │
       │                              Set status=PENDING       Save to DB
       │                              Set audit fields
       ▼
201 Created (Task JSON returned to UI)
```

### 2. View Tasks

```
User opens task list (Angular)
       │
       ▼
GET /api/v1/tasks?userId=xxx  ──► TaskController  ──► TaskService  ──► TaskRepository
       │                                                                    │
       │                                                         SELECT WHERE userId=xxx
       ▼
200 OK (List of Task JSON returned to UI)
```

### 3. Mark Task as Complete

```
User clicks "Complete" button (Angular)
       │
       ▼
PATCH /api/v1/tasks/{id}/complete  ──► TaskController  ──► TaskService  ──► TaskRepository
       │                                                       │                  │
       │                                          Validate task belongs      Update in DB
       │                                          to user, set status
       │                                          =COMPLETED, update
       │                                          audit fields
       ▼
200 OK (Updated Task JSON returned to UI)
```

---

## Frontend–Backend Interaction

- Angular uses `HttpClient` to make REST calls to the Spring Boot API.
- **Development**: Angular dev server (`localhost:4200`) proxies API requests to Spring Boot (`localhost:8080`).
- **Production**: Nginx serves the Angular build and reverse-proxies `/api/` requests to the backend container.
- CORS is configured on the Spring Boot side to allow requests from the Angular origin.
- API base URL is managed via Angular `environment` files for flexibility across environments.

---

## Getting Started

### Prerequisites

| Tool           | Required Version |
|----------------|-----------------|
| Java JDK       | 17+             |
| Maven          | 3.9+            |
| Node.js        | 18+             |
| npm            | 9+              |
| Angular CLI    | 17+             |
| Docker         | 24+             |
| Docker Compose | 2.x             |
| kubectl        | 1.28+           |

### Run with Docker Compose

```bash
# From the project root (002_task_app/)
docker-compose up --build
```

This starts 3 containers:

| Container        | Port  | Description                      |
|------------------|-------|----------------------------------|
| **postgres**     | 5432  | PostgreSQL database              |
| **task-service** | 8080  | Spring Boot REST API             |
| **task-ui**      | 80    | Angular app served via Nginx     |

Access the app at: **http://localhost**

### Run Locally (without Docker)

#### 1. Start PostgreSQL

Ensure PostgreSQL is running on `localhost:5432` with:
- Database: `taskdb`
- Username: `taskuser`
- Password: `taskpass`

#### 2. Start the Backend

```bash
cd 002_task_service
mvn spring-boot:run
```

Backend runs at: **http://localhost:8080**

#### 3. Start the Frontend

```bash
cd 002_task_ui
npm install
ng serve
```

Frontend runs at: **http://localhost:4200**

### Deploy to Kubernetes

```bash
# Create namespace and deploy all resources
kubectl apply -f k8s/namespace.yml
kubectl apply -f k8s/

# Verify pods are running
kubectl get pods -n task-app

# Access the frontend via the service
kubectl get svc -n task-app
```

---

## Assumptions & Simplifications

| Area            | Decision                                                                 |
|-----------------|--------------------------------------------------------------------------|
| Authentication  | None — `userId` is passed explicitly in API requests (basic version)     |
| Authorization   | None — any user can pass any `userId`                                    |
| Pagination      | Not implemented — all tasks for a user are returned                      |
| User Table      | No separate `User` entity — `userId` is a plain string                  |
| DDL Strategy    | Hibernate auto-generates tables (`ddl-auto: update`)                     |
| CORS            | Open for `localhost:4200` (development convenience)                      |
| Error Handling  | Global exception handler for `TaskNotFoundException` and validation      |

---

## Future Enhancements

- [ ] User authentication (JWT / OAuth2)
- [ ] Pagination and sorting for task lists
- [ ] Task priority levels (LOW, MEDIUM, HIGH)
- [ ] Due date and reminders
- [ ] Task categories / tags
- [ ] Search and filter tasks
- [ ] Soft delete for tasks
- [ ] Unit and integration tests
- [ ] CI/CD pipeline

---

## License

This project is for learning and internal use.
