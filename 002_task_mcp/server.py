from mcp.server.fastmcp import FastMCP
from mcp.server.fastmcp.server import TransportSecuritySettings
import httpx
from config import TASK_SERVICE_BASE_URL

mcp = FastMCP(
    "Task Manager MCP",
    host="0.0.0.0",
    port=8000,
    transport_security=TransportSecuritySettings(
        enable_dns_rebinding_protection=False,
    ),
)

API_BASE = f"{TASK_SERVICE_BASE_URL}/api/v1/tasks"


@mcp.tool()
async def add_task(title: str, user_id: str, description: str = "") -> str:
    """Add a new task for a user.

    Args:
        title: The task title (required, min 2 characters)
        user_id: The user ID who owns the task (required)
        description: Optional details about the task
    """
    payload = {"title": title, "userId": user_id}
    if description:
        payload["description"] = description

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(API_BASE, json=payload)

    if response.status_code == 201:
        task = response.json()
        return (
            f"Task created successfully!\n"
            f"  ID: {task['id']}\n"
            f"  Title: {task['title']}\n"
            f"  Status: {task['status']}\n"
            f"  User: {task['userId']}"
        )

    return f"Failed to create task (HTTP {response.status_code}): {response.text}"


@mcp.tool()
async def get_tasks(user_id: str) -> str:
    """Get all tasks for a user.

    Args:
        user_id: The user ID to retrieve tasks for (required)
    """
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(API_BASE, params={"userId": user_id})

    if response.status_code == 200:
        tasks = response.json()
        if not tasks:
            return f"No tasks found for user '{user_id}'."

        pending = [t for t in tasks if t["status"] == "PENDING"]
        completed = [t for t in tasks if t["status"] == "COMPLETED"]

        lines = [f"Tasks for user '{user_id}' ({len(tasks)} total):\n"]

        if pending:
            lines.append(f"PENDING ({len(pending)}):")
            for t in pending:
                lines.append(f"  [{t['id']}] {t['title']}")
                if t.get("description"):
                    lines.append(f"       {t['description']}")

        if completed:
            lines.append(f"\nCOMPLETED ({len(completed)}):")
            for t in completed:
                lines.append(f"  [{t['id']}] {t['title']}")

        return "\n".join(lines)

    return f"Failed to get tasks (HTTP {response.status_code}): {response.text}"


@mcp.tool()
async def complete_task(task_id: int, user_id: str) -> str:
    """Mark a task as complete.

    Args:
        task_id: The ID of the task to complete (required)
        user_id: The user ID who owns the task (required)
    """
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.patch(
            f"{API_BASE}/{task_id}/complete",
            json={"userId": user_id},
        )

    if response.status_code == 200:
        task = response.json()
        return (
            f"Task marked as complete!\n"
            f"  ID: {task['id']}\n"
            f"  Title: {task['title']}\n"
            f"  Status: {task['status']}"
        )

    if response.status_code == 404:
        return f"Task with ID {task_id} not found for user '{user_id}'."

    return f"Failed to complete task (HTTP {response.status_code}): {response.text}"


if __name__ == "__main__":
    mcp.run(transport="sse")
