package com.pla.task.controller;

import com.pla.task.dto.TaskRequestDTO;
import com.pla.task.dto.TaskResponseDTO;
import com.pla.task.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    public ResponseEntity<TaskResponseDTO> createTask(@Valid @RequestBody TaskRequestDTO request) {
        TaskResponseDTO created = taskService.createTask(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<TaskResponseDTO>> getTasksByUserId(@RequestParam String userId) {
        List<TaskResponseDTO> tasks = taskService.getTasksByUserId(userId);
        return ResponseEntity.ok(tasks);
    }

    @PatchMapping("/{taskId}/complete")
    public ResponseEntity<TaskResponseDTO> markTaskComplete(
            @PathVariable Long taskId,
            @RequestBody Map<String, String> body) {
        String userId = body.get("userId");
        TaskResponseDTO updated = taskService.markTaskComplete(taskId, userId);
        return ResponseEntity.ok(updated);
    }
}
