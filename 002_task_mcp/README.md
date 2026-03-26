# Task Manager MCP Server

MCP (Model Context Protocol) server that exposes the Task Management REST APIs as tools for LLMs.

## Architecture

```
LLM (Claude, etc.)  ──MCP Protocol──→  task-mcp  ──HTTP──→  task-service  ──JDBC──→  PostgreSQL
```

The MCP server acts as a bridge between LLMs and the backend API. It does **not** connect to the database directly — it calls the same REST endpoints that the Angular UI uses.

## Tools Exposed

| Tool | Description | Parameters |
|------|-------------|------------|
| `add_task` | Create a new task | `title` (required), `user_id` (required), `description` (optional) |
| `get_tasks` | List all tasks for a user | `user_id` (required) |
| `complete_task` | Mark a task as done | `task_id` (required), `user_id` (required) |

## Running

### Via Docker Compose (recommended)

```bash
docker compose up -d --build task-mcp
```

The MCP server will be available at `http://localhost:8000/sse`.

### Standalone (for development)

```bash
cd 002_task_mcp
pip install -r requirements.txt
export TASK_SERVICE_BASE_URL=http://localhost:8080
python server.py
```

## Connecting an LLM

### VS Code (Copilot) — mcp.json

Create `.vscode/mcp.json` in your workspace:

```json
{
  "servers": {
    "task-manager": {
      "type": "sse",
      "url": "http://localhost:8000/sse"
    }
  }
}
```

### Claude Desktop — claude_desktop_config.json

Add to your Claude Desktop config:

```json
{
  "mcpServers": {
    "task-manager": {
      "type": "sse",
      "url": "http://localhost:8000/sse"
    }
  }
}
```

Then chat naturally: *"Show all tasks for user-001"* or *"Add a task called 'Review PR' for user-001"*.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `TASK_SERVICE_BASE_URL` | `http://task-service:8080` | Backend API base URL |
| `MCP_SERVER_HOST` | `0.0.0.0` | Host to bind the SSE server |
| `MCP_SERVER_PORT` | `8000` | Port for the SSE server |

## Tech Stack

- Python 3.12
- FastMCP (MCP SDK)
- httpx (async HTTP client)
